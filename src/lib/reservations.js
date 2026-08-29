import { supabase } from "./supabase";

export async function reserveBag(bagId, quantity) {
  const { data, error } = await supabase.rpc("reserve_bag", {
    p_bag_id: bagId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
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

export async function getReservation(id) {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, bags(price_cents)")
    .eq("id", id)
    .single();
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

export async function getMyReservations(userId) {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "*, bags(title, price_cents, pickup_start, pickup_end, image_url, merchant_id, merchants(business_name, city)), reviews(id, rating, comment)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
