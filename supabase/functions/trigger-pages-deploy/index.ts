// Déclenche immédiatement un redéploiement GitHub Pages dès qu'un panier
// change en base — remplace la dépendance au cron GitHub Actions
// (*/15 * * * *, voir .github/workflows/deploy.yml), qui s'est avéré ne
// jamais se déclencher de façon fiable (constaté le 2026-11-23 : aucun run
// "schedule" sur tout un mois d'historique, seuls les push et déclenchements
// manuels apparaissent). Les pages statiques commerçant (/commercant/<slug>/,
// avec leur QR code) restaient donc figées sur l'état du dernier déploiement
// de code tant que personne ne poussait de commit.
//
// Appelé par un Database Webhook Supabase sur la table `bags` (insert et
// update) — configuré dans Dashboard → Database → Webhooks, pas en SQL,
// pour ne jamais committer PAGES_WEBHOOK_SECRET dans ce repo public.
//
// Secrets requis (Dashboard → Edge Functions → Secrets) :
// - GITHUB_DISPATCH_TOKEN : PAT GitHub dédié, scope "Actions: Read and
//   write" uniquement sur relief-lu-app- — jamais le token git personnel
//   (trop large), pour limiter les dégâts si ce secret fuit un jour.
// - PAGES_WEBHOOK_SECRET : valeur partagée vérifiée ci-dessous, pour
//   qu'un tiers connaissant l'URL publique de la fonction ne puisse pas
//   déclencher des déploiements à volonté.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const REPO = "tatucabelgique-create/relief-lu-app-";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const providedSecret = req.headers.get("x-webhook-secret");
  if (!providedSecret || providedSecret !== Deno.env.get("PAGES_WEBHOOK_SECRET")) {
    return new Response(JSON.stringify({ error: "Non autorisé." }), { status: 401, headers: corsHeaders });
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/deploy.yml/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("GITHUB_DISPATCH_TOKEN")}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: "main" }),
    });

    if (!res.ok) {
      const body = await res.text();
      return new Response(JSON.stringify({ error: `GitHub a refusé le déclenchement (${res.status}): ${body}` }), {
        status: 502,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
