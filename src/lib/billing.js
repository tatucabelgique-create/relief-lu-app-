import { supabase } from "./supabase";

// Mêmes taux que src/lib/merchantStats.js (stats affichées au commerçant) —
// à garder synchronisés, voir le commentaire là-bas pour le détail.
const COMMISSION_RATE = 0.2;
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
    .select("id, quantity, created_at, bags(title, price_cents, merchant_id, merchants(business_name))")
    .eq("payment_status", "paid")
    .gte("created_at", rangeStart.toISOString())
    .lte("created_at", rangeEnd.toISOString());
  if (error) throw error;

  const byMerchant = {};
  for (const r of reservations) {
    const bag = r.bags;
    if (!bag?.merchant_id) continue;
    if (!byMerchant[bag.merchant_id]) {
      byMerchant[bag.merchant_id] = {
        merchantId: bag.merchant_id,
        businessName: bag.merchants?.business_name || "—",
        reservationCount: 0,
        unitsSold: 0,
        revenueCents: 0,
        lines: [],
      };
    }
    const m = byMerchant[bag.merchant_id];
    m.reservationCount += 1;
    m.unitsSold += r.quantity;
    m.revenueCents += bag.price_cents * r.quantity;
    m.lines.push({
      title: bag.title,
      quantity: r.quantity,
      unitPriceCents: bag.price_cents,
      createdAt: r.created_at,
    });
  }

  return Object.values(byMerchant)
    .map((m) => {
      const commissionHtCents = Math.round(m.revenueCents * COMMISSION_RATE);
      const vatCents = Math.round(commissionHtCents * VAT_RATE);
      const commissionTtcCents = commissionHtCents + vatCents;
      return {
        ...m,
        revenue: m.revenueCents / 100,
        commissionHt: commissionHtCents / 100,
        vat: vatCents / 100,
        commissionTtc: commissionTtcCents / 100,
        netAmount: (m.revenueCents - commissionTtcCents) / 100,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function invoicesToCsv(invoices, weekStart, weekEnd) {
  const header = [
    "Commerçant",
    "Réservations",
    "Unités vendues",
    "CA brut (€)",
    "Commission HT (€)",
    "TVA 17% (€)",
    "Commission TTC (€)",
    "Net à verser (€)",
  ];
  const rows = invoices.map((inv) => [
    inv.businessName,
    inv.reservationCount,
    inv.unitsSold,
    inv.revenue.toFixed(2),
    inv.commissionHt.toFixed(2),
    inv.vat.toFixed(2),
    inv.commissionTtc.toFixed(2),
    inv.netAmount.toFixed(2),
  ]);
  const lines = [
    `Facturation relief.lu — semaine du ${toDateInputValue(weekStart)} au ${toDateInputValue(weekEnd)}`,
    "",
    header.join(";"),
    ...rows.map((r) => r.join(";")),
  ];
  return lines.join("\n");
}
