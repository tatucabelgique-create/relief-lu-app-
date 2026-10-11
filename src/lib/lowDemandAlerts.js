import { supabase } from "./supabase";

export async function isLowDemandAlertsEnabled() {
  const { data } = await supabase.from("feature_flags").select("enabled").eq("key", "low_demand_alerts").single();
  return !!data?.enabled;
}
