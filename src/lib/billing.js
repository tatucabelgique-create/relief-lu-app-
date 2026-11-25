import { supabase } from "./supabase";

// Même taux par défaut que src/lib/merchantStats.js — mais ici, contrairement
// à l'ancienne version de ce fichier, le taux RÉELLEMENT appliqué est celui
// de chaque commerçant (merchants.commission_rate, v28), pas une constante
// unique : cet écran calcule les montants à reverser pour de vrai, un
// partenaire avec un taux différent doit être facturé à son propre taux,
// pas au taux par défaut.
const DEFAULT_COMMISSION_RATE = 0.21;
const VAT_RATE = 0.17;

// Lundi 00:00 -> dimanche 23:59:59 de la semaine complète précédant
// aujourd'hui (jamais la semaine en cours, forcément incomplète).
export function getPreviousWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = dimanche
  const diffToMonday = day === 0 ? 6 : day - 1;
  const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  const start = new Date(thisMonday);
  start.setDate(start.getDate() - 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

export { toDateInputValue };

// Réservations payées dans l'intervalle [weekStart, weekEnd] (dates,
// bornes incluses), groupées par commerçant, avec le détail ligne à ligne.
export async function generateWeeklyInvoices(weekStart, weekEnd) {
  const rangeStart = new Date(weekStart);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(weekEnd);
  rangeEnd.setHours(23, 59, 59, 999);

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(
      "id, quantity, created_at, payment_method, bags(title, price_cents, merchant_id, merchants(business_name, commission_rate, stripe_fee_cents))"
    )
    .eq("payment_status", "paid")
    .gte("created_at", rangeStart.toISOString())
    .lte("created_at", rangeEnd.toISOString());
  if (error) throw error;

  // Carte : relief.lu reçoit le paiement via Stripe (destination charge) et
  // transfère déjà le net au commerçant automatiquement — cette ligne n'est
  // qu'un récapitulatif de ce que ce virement aurait dû être. Espèces :
  // personne ne passe par Stripe, le commerçant garde tout l'argent en main
  // — ce qu'il doit alors à relief.lu, c'est uniquement la commission, pas
  // de frais Stripe (jamais prélevé sur une vente non traitée par Stripe).
  // D'où deux accumulateurs séparés par commerçant plutôt qu'un seul : le
  // calcul (taux, TVA, frais) diverge selon qui a matériellement l'argent.
  const byMerchant = {};
  for (const r of reservations) {
    const bag = r.bags;
    if (!bag?.merchant_id) continue;
    if (!byMerchant[bag.merchant_id]) {
      byMerchant[bag.merchant_id] = {
        merchantId: bag.merchant_id,
        businessName: bag.merchants?.business_name || "—",
        commissionRate: bag.merchants?.commission_rate ?? DEFAULT_COMMISSION_RATE,
        // HT, par transaction (voir create-checkout-session/index.ts) — pas
        // multiplié par la quantité, additionné une fois par réservation
        // (chaque réservation = un paiement Stripe) juste en dessous.
        stripeFeeHtCentsPerTxn: bag.merchants?.stripe_fee_cents ?? 0,
        reservationCount: 0,
        unitsSold: 0,
        cardRevenueCents: 0,
        cashRevenueCents: 0,
        stripeFeeTotalHtCents: 0,
        lines: [],
      };
    }
    const m = byMerchant[bag.merchant_id];
    const lineRevenueCents = bag.price_cents * r.quantity;
    m.reservationCount += 1;
    m.unitsSold += r.quantity;
    if (r.payment_method === "cash") {
      m.cashRevenueCents += lineRevenueCents;
    } else {
      m.cardRevenueCents += lineRevenueCents;
      m.stripeFeeTotalHtCents += m.stripeFeeHtCentsPerTxn;
    }
    m.lines.push({
      title: bag.title,
      quantity: r.quantity,
      unitPriceCents: bag.price_cents,
      createdAt: r.created_at,
      paymentMethod: r.payment_method || "card",
    });
  }

  return Object.values(byMerchant)
    .map((m) => {
      const revenueCents = m.cardRevenueCents + m.cashRevenueCents;
      const commissionHtCents = Math.round(revenueCents * m.commissionRate);
      const vatCents = Math.round(commissionHtCents * VAT_RATE);
      const commissionTtcCents = commissionHtCents + vatCents;

      const stripeFeeVatCents = Math.round(m.stripeFeeTotalHtCents * VAT_RATE);
      const stripeFeeTtcCents = m.stripeFeeTotalHtCents + stripeFeeVatCents;

      // Commission TTC répartie au prorata carte/espèces (même taux
      // appliqué aux deux, seule la base diffère) — sert à isoler la part
      // que le commerçant doit directement à relief.lu (espèces) de celle
      // que Stripe a déjà réglée pour nous (carte).
      const cashCommissionTtcCents = revenueCents > 0 ? Math.round((commissionTtcCents * m.cashRevenueCents) / revenueCents) : 0;
      const cardCommissionTtcCents = commissionTtcCents - cashCommissionTtcCents;

      // Récapitulatif de ce que Stripe a dû transférer automatiquement.
      const netAmountCents = m.cardRevenueCents - cardCommissionTtcCents - stripeFeeTtcCents;
      // Ce que le commerçant doit verser à relief.lu pour les ventes
      // encaissées en espèces (aucun virement automatique dans ce cas).
      const cashOwedCents = cashCommissionTtcCents;

      return {
        ...m,
        revenue: revenueCents / 100,
        cardRevenue: m.cardRevenueCents / 100,
        cashRevenue: m.cashRevenueCents / 100,
        commissionHt: commissionHtCents / 100,
        vat: vatCents / 100,
        commissionTtc: commissionTtcCents / 100,
        stripeFeeTtc: stripeFeeTtcCents / 100,
        netAmount: netAmountCents / 100,
        cashOwed: cashOwedCents / 100,
        // Positif = relief.lu doit encore virer ce montant au commerçant ;
        // négatif = le commerçant doit ce montant à relief.lu (ses ventes
        // espèces dépassent ce que Stripe lui reverserait côté carte).
        finalBalance: (netAmountCents - cashOwedCents) / 100,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function invoicesToCsv(invoices, weekStart, weekEnd) {
  const header = [
    "Commerçant",
    "Taux commission",
    "Réservations",
    "Unités vendues",
    "CA brut (€)",
    "dont CA espèces (€)",
    "Commission HT (€)",
    "TVA 17% (€)",
    "Commission TTC (€)",
    "Frais Stripe négociés TTC (€)",
    "Net Stripe à verser (€)",
    "Dû par le commerçant (espèces) (€)",
    "Solde final (€)",
  ];
  const rows = invoices.map((inv) => [
    inv.businessName,
    `${Math.round(inv.commissionRate * 100)}%`,
    inv.reservationCount,
    inv.unitsSold,
    inv.revenue.toFixed(2),
    inv.cashRevenue.toFixed(2),
    inv.commissionHt.toFixed(2),
    inv.vat.toFixed(2),
    inv.commissionTtc.toFixed(2),
    inv.stripeFeeTtc.toFixed(2),
    inv.netAmount.toFixed(2),
    inv.cashOwed.toFixed(2),
    inv.finalBalance.toFixed(2),
  ]);
  const lines = [
    `Facturation relief.lu — semaine du ${toDateInputValue(weekStart)} au ${toDateInputValue(weekEnd)}`,
    "",
    header.join(";"),
    ...rows.map((r) => r.join(";")),
  ];
  return lines.join("\n");
}
