import { supabase } from "./supabase";

// Nom à corriger après le premier déploiement de supabase/functions/refund-reservation/
// (Supabase donne un nom aléatoire au déploiement, voir payments.js/notify.js
// pour le même genre de constante) — fonction pas encore déployée au moment
// de l'écriture de ce fichier, donc pas encore de nom réel à mettre ici.
const REFUND_FUNCTION_NAME = "refund-reservation";

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
      "*, bags(title, price_cents, pickup_start, pickup_end, image_url, merchant_id, merchants(business_name, city, waive_service_fee)), reviews(id, rating, comment)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
