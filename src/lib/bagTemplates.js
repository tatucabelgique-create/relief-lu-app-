import { supabase } from "./supabase";

export async function loadBagTemplates(merchantId) {
  const { data, error } = await supabase
    .from("bag_templates")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createBagTemplate(payload) {
  const { data, error } = await supabase.from("bag_templates").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBagTemplate(templateId) {
  const { error } = await supabase.from("bag_templates").delete().eq("id", templateId);
  if (error) throw error;
}
