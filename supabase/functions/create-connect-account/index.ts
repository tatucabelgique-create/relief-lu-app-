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
      // Stripe ne recommande plus la création de comptes via l'API Accounts v1
      // pour les nouvelles plateformes Connect (celle-ci l'a immédiatement
      // refusée) — v2 (encore en preview, d'où l'en-tête Stripe-Version dédié
      // ci-dessous) est requis. stripe-node@17 n'a pas encore de méthode
      // dédiée pour ce endpoint, d'où l'appel HTTP direct. "recipient" avec
      // stripe_balance.stripe_transfers remplace la capability "transfers" de
      // la v1 ; le lien d'onboarding (plus bas) reste, lui, sur l'API v1
      // classique — un ID de compte v2 y est explicitement accepté (voir
      // docs.stripe.com/connect/accounts-v2).
      const v2Res = await fetch("https://api.stripe.com/v2/core/accounts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")!}`,
          "Stripe-Version": "2026-08-26.preview",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_email: user.email,
          display_name: merchant.business_name,
          dashboard: "express",
          identity: { country: "lu" },
          configuration: {
            merchant: { capabilities: { card_payments: { requested: true } } },
            recipient: { capabilities: { stripe_balance: { stripe_transfers: { requested: true } } } },
          },
          defaults: {
            currency: "eur",
            responsibilities: { fees_collector: "stripe", losses_collector: "stripe" },
          },
        }),
      });
      const v2Account = await v2Res.json();
      if (!v2Res.ok) {
        return new Response(JSON.stringify({ error: v2Account.error?.message || "Erreur Stripe (création du compte)." }), {
          status: 500,
          headers: corsHeaders,
        });
      }
      accountId = v2Account.id;
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
