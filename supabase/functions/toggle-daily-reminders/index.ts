// Supabase Edge Function — active/désactive le rappel quotidien (feature flag
// "daily_reminders"), appelée par DailyReminderToggle.jsx dans l'admin.
// Même secret partagé que send-marketing-push (MARKETING_PUSH_SECRET) — un
// seul admin, pas besoin d'un secret dédié en plus.
// À déployer depuis le dashboard Supabase (Edge Functions → Code → coller
// ceci → Deploy).
//
// Appel :
// curl -X POST https://<ref>.supabase.co/functions/v1/toggle-daily-reminders \
//   -H "content-type: application/json" \
//   -d '{"enabled": true, "admin_secret": "<MARKETING_PUSH_SECRET>"}'

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_SECRET = Deno.env.get("MARKETING_PUSH_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { enabled, admin_secret } = await req.json();

  if (admin_secret !== ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Clé secrète incorrecte." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled: !!enabled, updated_at: new Date().toISOString() })
    .eq("key", "daily_reminders");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ enabled: !!enabled }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
