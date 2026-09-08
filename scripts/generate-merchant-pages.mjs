// Génère une page statique indexable par commerçant vérifié, sur le modèle
// de la stratégie SEO programmatique de TGTG (une page crawlable par
// commerçant/sachet, plutôt qu'une seule page d'accueil dans le sitemap).
// Tourne après `vite build` (voir "postbuild" dans package.json) : le SPA
// React ne peut pas être crawlé de façon fiable, ces pages le sont par
// construction (HTML statique généré ici, pas de JS nécessaire pour lire
// le contenu).
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "..", "dist");
const SITE = "https://relief.lu";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents (marques diacritiques après NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderPage(merchant, slug) {
  const name = escapeHtml(merchant.business_name);
  const city = escapeHtml(merchant.city || "");
  const address = escapeHtml([merchant.address, merchant.city].filter(Boolean).join(", "));
  const title = `${merchant.business_name}${city ? " — " + city : ""} | relief.lu`;
  const description = `Découvrez les invendus à prix réduit de ${merchant.business_name}${city ? " à " + city : ""} sur relief.lu, la plateforme anti-gaspillage alimentaire luxembourgeoise.`;
  const url = `${SITE}/commercant/${slug}/`;
  const appUrl = `${SITE}/app.html?merchant=${merchant.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: merchant.business_name,
    url,
    ...(merchant.address && { address: { "@type": "PostalAddress", streetAddress: merchant.address, addressLocality: merchant.city || "", addressCountry: "LU" } }),
    ...(merchant.lat != null && merchant.lng != null && { geo: { "@type": "GeoCoordinates", latitude: merchant.lat, longitude: merchant.lng } }),
    ...(merchant.logo_url && { image: merchant.logo_url }),
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="relief.lu">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${url}">
<link rel="icon" href="/icon-192.png">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
  :root{--navy:#16232C;--navy-2:#1E313D;--paper:#EFE6D3;--paper-dim:#B7AB8C;--honey:#E8A33D;}
  *{box-sizing:border-box;}
  body{margin:0;background:var(--navy);color:var(--paper);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
  .wrap{max-width:640px;margin:0 auto;padding:48px 24px;}
  .logo{display:flex;align-items:center;gap:12px;margin-bottom:40px;}
  .logo img{width:36px;height:36px;border-radius:10px;}
  .logo b{font-size:20px;}
  h1{font-size:32px;line-height:1.2;margin:0 0 12px;}
  .addr{color:var(--paper-dim);font-size:17px;margin:0 0 28px;}
  p{font-size:17px;line-height:1.6;color:var(--paper-dim);}
  .cta{display:inline-block;margin-top:24px;background:var(--honey);color:var(--navy);font-weight:700;text-decoration:none;padding:16px 28px;border-radius:100px;}
  .back{display:inline-block;margin-top:40px;color:var(--paper-dim);text-decoration:none;font-size:15px;}
</style>
</head>
<body>
  <div class="wrap">
    <div class="logo"><img src="/icon-192.png" alt=""><b>relief.lu</b></div>
    <h1>${name}</h1>
    ${address ? `<p class="addr">${address}</p>` : ""}
    <p>${name} lutte contre le gaspillage alimentaire au Luxembourg en proposant ses invendus à prix réduit sur relief.lu. Réservez en ligne et récupérez votre panier directement sur place.</p>
    <a class="cta" href="${appUrl}">Voir les paniers disponibles →</a>
    <br>
    <a class="back" href="${SITE}/app.html">← Tous les commerçants relief.lu</a>
  </div>
</body>
</html>`;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[generate-merchant-pages] Variables Supabase manquantes, génération ignorée.");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: merchants, error } = await supabase
    .from("merchants")
    .select("id, business_name, address, city, logo_url, lat, lng")
    .eq("verified", true)
    .not("address", "is", null);

  if (error) {
    console.error("[generate-merchant-pages] Erreur Supabase:", error.message);
    return;
  }

  const usedSlugs = new Set();
  const urls = [`${SITE}/`];

  for (const merchant of merchants || []) {
    let slug = slugify(`${merchant.business_name}-${merchant.city || ""}`);
    if (usedSlugs.has(slug)) slug = `${slug}-${merchant.id.slice(0, 6)}`;
    usedSlugs.add(slug);

    const dir = resolve(DIST, "commercant", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "index.html"), renderPage(merchant, slug));
    urls.push(`${SITE}/commercant/${slug}/`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
  writeFileSync(resolve(DIST, "sitemap.xml"), sitemap);

  console.log(`[generate-merchant-pages] ${merchants?.length || 0} page(s) commerçant générée(s), sitemap mis à jour (${urls.length} URL(s)).`);
}

main().catch((err) => {
  // Ne doit jamais faire échouer le build/déploiement pour un souci SEO annexe.
  console.error("[generate-merchant-pages] Erreur inattendue:", err);
});
