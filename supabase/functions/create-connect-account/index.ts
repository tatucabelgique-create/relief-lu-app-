// Crée (si besoin) le compte Stripe Connect Express du commerçant connecté,
// et renvoie un lien d'onboarding hébergé par Stripe (formulaire IBAN/identité,
// aucune donnée bancaire ne transite par relief.lu). En mode test, Stripe
// accepte des données factices (voir stripe.com/docs/connect/testing) — pas
// besoin de vraies coordonnées bancaires pour valider le flux.
// Secrets requis (déjà en place, mêmes que create-checkout-session) :
// STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Non authentifié." }), { status: 401, headers: corsHeaders });
    }

    const { return_base } = await req.json();
    const base = (return_base || "https://relief.lu/").replace(/\/+$/, "");

    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id, business_name, stripe_account_id")
      .eq("id", user.id)
      .single();
    if (merchantError || !merchant) {
      return new Response(JSON.stringify({ error: "Commerçant introuvable." }), { status: 404, headers: corsHeaders });
    }

    let accountId = merchant.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "LU",
        email: user.email,
        business_type: "individual",
        business_profile: { name: merchant.business_name },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await supabase.from("merchants").update({ stripe_account_id: accountId }).eq("id", user.id);
    }

    // refresh_url : Stripe y renvoie si le lien d'onboarding a expiré (durée de
    // vie courte) — on redemande simplement un nouveau lien depuis la même page.
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${base}/app.html?view=merchant`,
      return_url: `${base}/app.html?view=merchant&stripe_onboarding=1`,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
