import { supabase } from "./supabase";

export async function loadActiveBags() {
  // pickup_end dans le futur : un sachet dont le créneau de retrait est
  // dépassé n'a plus de sens à afficher/réserver, récurrent ou non — pour
  // un sachet récurrent, il redevient visible une fois reprogrammé par
  // refresh_recurring_bags() (tâche planifiée, voir schema-v9).
  const { data, error } = await supabase
    .from("bags")
    .select("*, merchants(business_name, address, city, lat, lng, logo_url)")
    .eq("status", "active")
    .gt("quantity_left", 0)
    .gt("pickup_end", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// "Ils ont eu du succès aujourd'hui" façon TGTG : preuve sociale, sachets
// épuisés dont le créneau de retrait tombe aujourd'hui.
export async function loadSoldOutToday() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("bags")
    .select("*, merchants(business_name, address, city, lat, lng, logo_url)")
    .eq("status", "sold_out")
    .gte("pickup_start", startOfDay.toISOString())
    .lte("pickup_start", endOfDay.toISOString())
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return data;
}

export async function loadMerchantBags(merchantId) {
  const { data, error } = await supabase
    .from("bags")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadBagPhoto(userId, file) {
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("bag-photos").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("bag-photos").getPublicUrl(path).data.publicUrl;
}

export async function publishBag(payload) {
  const { data, error } = await supabase.from("bags").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function cancelBag(bagId) {
  // is_recurring doit tomber à false ici : sinon refresh_recurring_bags()
  // (tâche planifiée toutes les 15 min, voir schema-v9) republie quand même
  // ce sachet le lendemain — annuler ne serait alors jamais définitif pour
  // un sachet récurrent.
  const { error } = await supabase.from("bags").update({ status: "cancelled", is_recurring: false }).eq("id", bagId);
  if (error) throw error;
}
