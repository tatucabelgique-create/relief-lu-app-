// Supabase Edge Function — appelée automatiquement par un trigger Postgres
// (voir db/schema-v24-notify-new-merchant.sql) juste après la création d'une
// nouvelle fiche commerçant (première inscription, pas les modifications
// ultérieures — le trigger est en AFTER INSERT, pas AFTER UPDATE).
// Envoie un email à l'admin via Resend plutôt qu'une notification push —
// aucun abonnement à gérer, livré même si l'admin n'a pas l'app ouverte.
// À déployer depuis le dashboard Supabase (Edge Functions → Code → coller
// ceci → Deploy), puis ajouter le secret RESEND_API_KEY (Project Settings →
// Edge Functions → Secrets) avec une clé créée sur resend.com (gratuit).
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

// Même compte que ADMIN_EMAIL côté app (src/lib/admin.js) — dupliqué ici
// plutôt qu'importé car les Edge Functions Deno n'ont pas accès au code
// src/ du build Vite.
const ADMIN_NOTIFY_EMAIL = "giovanni.ehp@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const merchant = await req.json();

  const html = `
    <h2>Nouveau commerçant inscrit sur relief.lu</h2>
    <p><b>${merchant.business_name ?? "(nom manquant)"}</b></p>
    <p>${[merchant.address, merchant.city].filter(Boolean).join(", ") || "(adresse manquante)"}</p>
    <p>${merchant.phone ?? "(pas de téléphone)"} — ${merchant.registration_number ?? "(pas de n° RCS)"}</p>
    <p>${merchant.email ?? "(pas d'email)"}</p>
    <p><a href="https://relief.lu/app.html?view=admin">Vérifier sur relief.lu →</a></p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "relief.lu <onboarding@resend.dev>",
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Nouveau commerçant : ${merchant.business_name ?? "?"}`,
      html,
    }),
  });

  if (!res.ok) {
    // On loggue mais on ne fait jamais échouer l'inscription du commerçant
    // pour un email qui n'est pas parti — c'est un best-effort.
    console.error("Resend error", await res.text());
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
