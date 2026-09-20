import { supabase } from "./supabase";

export async function isDailyReminderEnabled() {
  const { data } = await supabase.from("feature_flags").select("enabled").eq("key", "daily_reminders").single();
  return !!data?.enabled;
}

export async function getDailyReminderDays(userId) {
  const { data, error } = await supabase.from("daily_reminders").select("days").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return new Set(data?.days || []);
}

export async function setDailyReminderDays(userId, days) {
  const { error } = await supabase
    .from("daily_reminders")
    .upsert({ user_id: userId, days: [...days], updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}
