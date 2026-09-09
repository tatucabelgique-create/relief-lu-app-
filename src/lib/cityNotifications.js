import { supabase } from "./supabase";

export async function getCitySubscriptions(userId) {
  const { data, error } = await supabase.from("city_subscriptions").select("city").eq("user_id", userId);
  if (error) throw error;
  return new Set((data || []).map((row) => row.city));
}

export async function subscribeToCity(userId, city) {
  const { error } = await supabase.from("city_subscriptions").upsert({ user_id: userId, city }, { onConflict: "user_id,city" });
  if (error) throw error;
}

export async function unsubscribeFromCity(userId, city) {
  const { error } = await supabase.from("city_subscriptions").delete().eq("user_id", userId).eq("city", city);
  if (error) throw error;
}
