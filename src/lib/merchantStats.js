import { supabase } from "./supabase";

// Taux appliqués sur le chiffre d'affaires encaissé (réservations payées
// uniquement — pending/failed/refunded ne comptent pas comme vente réelle) :
// commission de 20% hors TVA (relevée depuis 18% — les frais Stripe rognaient
// trop la marge nette), TVA luxembourgeoise standard de 17% dessus.
const COMMISSION_RATE = 0.2;
const VAT_RATE = 0.17;

// Nombre de sachets vendus (payés) sur les 28 derniers jours glissants — sert
// à déterminer le prix conseillé à la publication (voir MerchantDashboard :
// -70% en dessous de 5 sachets vendus sur la période, -50% au-delà, même
// mécanique que TGTG). Fenêtre glissante plutôt qu'un total cumulé : un
// commerçant qui ralentit doit repasser à la remise la plus attractive, pas
// rester bloqué sur -50% pour toujours à cause d'un pic passé.
export async function getRecentSoldCount(merchantId) {
  const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
  const { data: bags, error: bagsError } = await supabase.from("bags").select("id").eq("merchant_id", merchantId);
  if (bagsError) throw bagsError;
  const bagIds = bags.map((b) => b.id);
  if (!bagIds.length) return 0;

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("quantity")
    .in("bag_id", bagIds)
    .eq("payment_status", "paid")
    .gte("created_at", since);
  if (error) throw error;
  return reservations.reduce((sum, r) => sum + r.quantity, 0);
}

export async function getMerchantStats(merchantId) {
  const { data: bags, error: bagsError } = await supabase
    .from("bags")
    .select("id, price_cents, status")
    .eq("merchant_id", merchantId);
  if (bagsError) throw bagsError;

  const bagIds = bags.map((b) => b.id);
  const priceByBag = Object.fromEntries(bags.map((b) => [b.id, b.price_cents]));

  let reservations = [];
  if (bagIds.length) {
    const { data, error } = await supabase.from("reservations").select("status, payment_status, quantity, bag_id").in("bag_id", bagIds);
    if (error) throw error;
    reservations = data;
  }

  const paidReservations = reservations.filter((r) => r.payment_status === "paid");
  const totalReservations = reservations.length;
  const noShowCount = reservations.filter((r) => r.status === "no_show").length;

  const unitsSold = paidReservations.reduce((sum, r) => sum + r.quantity, 0);
  const revenueCents = paidReservations.reduce((sum, r) => sum + (priceByBag[r.bag_id] || 0) * r.quantity, 0);

  // Un sachet passe à 'expired' quand son créneau de retrait est dépassé
  // sans avoir été entièrement vendu (voir expire_unsold_bags, schema-v10) —
  // c'est le décompte le plus fiable d'"invendu" côté sachet.
  const bagsUnsold = bags.filter((b) => b.status === "expired").length;

  const commissionHtCents = Math.round(revenueCents * COMMISSION_RATE);
  const vatCents = Math.round(commissionHtCents * VAT_RATE);
  const commissionTtcCents = commissionHtCents + vatCents;

  return {
    bagsPublished: bags.length,
    bagsUnsold,
    unitsSold,
    totalReservations,
    noShowRate: totalReservations ? Math.round((noShowCount / totalReservations) * 100) : 0,
    revenue: revenueCents / 100,
    commissionHt: commissionHtCents / 100,
    vat: vatCents / 100,
    commissionTtc: commissionTtcCents / 100,
    netRevenue: (revenueCents - commissionTtcCents) / 100,
  };
}
