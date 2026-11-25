import { supabase } from "./supabase";

// Nom réel de la fonction déployée dans le dashboard Supabase (voir
// payments.js/notify.js pour le même genre de constante) — confirmé
// 2026-10-19, source supabase/functions/refund-reservation/.
const REFUND_FUNCTION_NAME = "smart-task";

export async function reserveBag(bagId, quantity, options = {}) {
  const { data, error } = await supabase.rpc("reserve_bag", {
    p_bag_id: bagId,
    p_quantity: quantity,
    p_payment_method: options.paymentMethod || "card",
    p_customer_phone: options.customerPhone ?? null,
    p_phone_contact_consent: options.phoneContactConsent ?? false,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

// Un seul no-show en espèces suffit à désactiver l'option pour ce compte
// (voir schema-v39) — revérifié côté serveur dans reserve_bag(), mais on
// évite ici de proposer un bouton qui échouera de toute façon à l'appel.
export async function hasCashNoShowHistory(userId) {
  const { count, error } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("payment_method", "cash")
    .eq("status", "no_show");
  if (error) throw error;
  return (count ?? 0) > 0;
}

// Appelée quand le client revient de Stripe Checkout sans avoir payé
// (annulation, retour arrière) — libère le stock tout de suite plutôt que
// d'attendre l'expiration de la session côté Stripe (jusqu'à 24h par défaut,
// réduite à 30 min mais ça reste trop long pour un client qui regarde
// l'appli immédiatement après). Sans effet si déjà payée/traitée (idempotent,
// voir release_reservation côté SQL) ou si la réservation appartient à
// quelqu'un d'autre (vérifié via auth.uid() dans la fonction).
export async function releaseReservation(id) {
  const { error } = await supabase.rpc("release_reservation", { p_reservation_id: id });
  if (error) throw error;
}

// Annulation + remboursement d'une réservation déjà payée — appelle l'edge
// function refund-reservation (vraie logique Stripe + resynchro base, voir
// schema-v33). L'autorisation et la fenêtre de 2h avant retrait sont
// vérifiées côté serveur, jamais seulement côté client.
export async function requestRefund(reservationId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${REFUND_FUNCTION_NAME}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ reservation_id: reservationId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors du remboursement.");
  return data;
}

export async function getReservation(id) {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, bags(price_cents, merchants(waive_service_fee))")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Recherche globale par code de retrait, tous sachets du commerçant
// confondus — le commerçant au comptoir ne sait pas toujours de quel sachet
// vient le code, lui demander de d'abord retrouver la bonne fiche sachet
// serait plus lent que l'ancien défilement visuel qu'on cherche justement à
// remplacer. La policy RLS "merchants can read reservations on their own
// bags" (schema-app.sql) filtre déjà aux sachets du commerçant connecté —
// un code appartenant à un autre commerçant renvoie simplement "aucune
// ligne", jamais une erreur ni les données d'un tiers.
export async function findReservationByCode(code) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const { data, error } = await supabase
    .from("reservations")
    .select("*, bags(title)")
    .eq("pickup_code", normalized)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getReservationsForBag(bagId) {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("bag_id", bagId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateReservationStatus(reservationId, status) {
  const { error } = await supabase.from("reservations").update({ status }).eq("id", reservationId);
  if (error) throw error;
}

// Spécifique au paiement en espèces : l'encaissement et le retrait ont lieu
// au même instant physique (le comptoir), contrairement au carte où le
// paiement est déjà acquis avant le retrait — un seul geste commerçant doit
// donc faire passer payment_status à 'paid' ET status à 'picked_up' (voir
// schema-v39 ; la policy RLS "merchants can update reservations on their
// own bags" autorise déjà les deux colonnes).
export async function confirmCashPickup(reservationId) {
  const { error } = await supabase
    .from("reservations")
    .update({ payment_status: "paid", status: "picked_up" })
    .eq("id", reservationId);
  if (error) throw error;
}

// Annuler un sachet (voir MerchantBagRow.jsx handleCancelBag) ne doit pas
// laisser de réservation "confirmed"/"pending" orpheline derrière lui — ni
// une résa carte abandonnée pas encore nettoyée par le cron de 5 minutes
// (schema-v35), ni surtout une résa espèces qui peut légitimement rester
// pending des heures (schema-v39). release_reservation() ne convient pas
// ici : elle refuse tout appelant qui n'est pas le propriétaire de la résa
// ou le webhook (auth.uid() null), et le commerçant qui annule est un tiers
// de ce point de vue. On fait donc un update direct — la policy RLS
// "merchants can update reservations on their own bags" l'autorise déjà sur
// toutes les colonnes. Pas de restauration de stock : le sachet lui-même
// passe à 'cancelled' juste après (voir cancelBag), la quantité n'a plus de
// sens à ce moment-là.
export async function cancelPendingReservationsForBag(bagId) {
  const { error } = await supabase
    .from("reservations")
    .update({ status: "cancelled", payment_status: "failed" })
    .eq("bag_id", bagId)
    .eq("status", "confirmed")
    .eq("payment_status", "pending");
  if (error) throw error;
}

export async function getMyReservations(userId) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "*, bags(title, price_cents, pickup_start, pickup_end, image_url, merchant_id, merchants(business_name, city, waive_service_fee)), reviews(id, rating, comment)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
