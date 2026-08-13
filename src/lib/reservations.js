import { supabase } from "./supabase";

export async function reserveBag(bagId, quantity) {
  const { data, error } = await supabase.rpc("reserve_bag", {
    p_bag_id: bagId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getReservation(id) {
  const { data, error } = await supabase.from("reservations").select("*").eq("id", id).single();
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
