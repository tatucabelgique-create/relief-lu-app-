// Génère une page statique indexable par commerçant vérifié, sur le modèle
// de la stratégie SEO programmatique de TGTG (une page crawlable par
// commerçant/sachet, plutôt qu'une seule page d'accueil dans le sitemap).
// Tourne après `vite build` (voir "build" dans package.json) : le SPA React
// ne peut pas être crawlé de façon fiable, ces pages le sont par
// construction (HTML statique généré ici, pas de JS nécessaire pour lire
// le contenu).
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { WebSocket } from "ws";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// supabase-js initialise toujours un client Realtime (WebSocket) même pour
// une simple requête ponctuelle, et Node 20 (utilisé par le workflow de
// déploiement) n'a pas de WebSocket global natif — contrairement à Node 22.
// Sans ce polyfill, createClient() plante immédiatement en CI.
if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

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

// Mêmes libellés que merchant.category.* dans src/lib/i18n.jsx (FR) — cette
// page statique n'a qu'une seule langue, pas besoin du système i18n complet.
const CATEGORY_LABELS = {
  boulangerie: "Boulangerie",
  restaurant: "Repas",
  plats_prepares: "Plats préparés",
  sushi: "Poké bowls & sushis",
  sandwichs: "Sandwichs & salades",
  epicerie: "Épicerie",
  snack: "Snack sucré/salé",
  traiteur: "Traiteur / cantine",
  supermarche: "Supermarché",
  autre: "Autre",
};

function formatPrice(cents) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

// `bag` : le sachet actif le plus récent de ce commerçant (ou null si aucun,
// cf. main()). `rating` : { avg, count } agrégé depuis `reviews`, ou null si
// ce commerçant n'a encore aucun avis.
function renderOfferBlock(bag, rating) {
  const ratingHtml = rating && rating.count > 0
    ? `<div class="rating">★ ${rating.avg.toFixed(1)} <span>(${rating.count} avis)</span></div>`
    : "";

  if (!bag) {
    return `
    <div class="offer offer-empty">
      <p class="offer-empty-msg">Épuisé pour le moment — vérifiez à nouveau plus tard.</p>
      ${ratingHtml}
    </div>`;
  }

  const hasDiscount = bag.original_price_cents && bag.original_price_cents > bag.price_cents;
  const discountPct = hasDiscount ? Math.round((1 - bag.price_cents / bag.original_price_cents) * 100) : null;
  const categoryLabel = CATEGORY_LABELS[bag.category] || CATEGORY_LABELS.autre;

  const dietTags = [bag.vegetarian && "Végétarien", bag.vegan && "Végan"].filter(Boolean);
  const dietHtml = dietTags.length
    ? `<div class="diet-tags">${dietTags.map((tag) => `<span class="diet-tag">${tag}</span>`).join("")}</div>`
    : "";

  // Même texte que bagDetail.packaging.info* (src/lib/i18n.jsx) — reformulé
  // au "vous" pour coller au reste de cette page statique (le reste de
  // l'app tutoie, voir BagDetail.jsx, mais cette page vouvoie déjà).
  let packagingText;
  if (bag.container_provided && bag.bag_provided) packagingText = "Le commerçant fournit le contenant et le sac.";
  else if (bag.container_provided) packagingText = "Le commerçant fournit le contenant. Apportez votre sac.";
  else if (bag.bag_provided) packagingText = "Le commerçant fournit le sac. Apportez votre contenant.";
  else packagingText = "Apportez votre propre contenant et votre sac.";

  // "Ingrédients & Allergènes" est un texte générique fixe côté app (pas de
  // donnée par sachet, voir BagDetail.jsx/schema-v6) — même principe ici,
  // affiché derrière un lien plutôt qu'en permanence pour ne pas surcharger
  // la page.
  const allergensText =
    "On ne peut jamais dire à l'avance ce que contiendra exactement un panier surprise — le commerçant le remplit avec ses invendus du jour. Pour toute question sur les allergènes ou la composition, demandez directement au commerçant lors du retrait.";

  return `
    <div class="offer">
      <span class="offer-category">${escapeHtml(categoryLabel)}</span>
      ${dietHtml}
      <p class="offer-title">${escapeHtml(bag.title)}</p>
      <div class="offer-price">
        ${hasDiscount ? `<span class="price-old">${formatPrice(bag.original_price_cents)}</span>` : ""}
        <span class="price-new">${formatPrice(bag.price_cents)}</span>
        ${discountPct ? `<span class="discount-badge">-${discountPct}%</span>` : ""}
      </div>
      ${ratingHtml}
      <p class="practical-info">📦 ${escapeHtml(packagingText)}</p>
      <details class="allergens">
        <summary>Ingrédients &amp; allergènes</summary>
        <p>${escapeHtml(allergensText)}</p>
      </details>
    </div>`;
}

function renderPage(merchant, slug, bag, rating, qrSvg) {
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
    ...(rating && rating.count > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.avg.toFixed(1), reviewCount: rating.count } }),
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
  .offer{margin-top:28px;padding:20px 24px;border:1px solid var(--navy-2);border-radius:16px;background:var(--navy-2);}
  .offer-category{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;color:var(--honey);}
  .offer-title{margin:6px 0 14px;font-size:19px;font-weight:700;color:var(--paper);}
  .offer-price{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;}
  .price-old{color:var(--paper-dim);text-decoration:line-through;font-size:16px;}
  .price-new{color:var(--paper);font-size:24px;font-weight:700;}
  .discount-badge{background:var(--honey);color:var(--navy);font-weight:700;font-size:13px;padding:3px 10px;border-radius:100px;}
  .offer-empty-msg{margin:0;color:var(--paper-dim);font-size:16px;}
  .rating{margin-top:14px;color:var(--honey);font-weight:700;font-size:15px;}
  .rating span{color:var(--paper-dim);font-weight:400;}
  .diet-tags{display:inline-flex;gap:6px;margin-left:8px;}
  .diet-tag{font-size:12px;font-weight:700;color:var(--navy);background:var(--paper-dim);padding:2px 8px;border-radius:100px;}
  .practical-info{margin:14px 0 0;font-size:15px;color:var(--paper-dim);}
  .allergens{margin-top:12px;}
  .allergens summary{cursor:pointer;color:var(--paper);font-size:15px;font-weight:700;text-decoration:underline;}
  .allergens p{margin:10px 0 0;font-size:15px;}
  .qr-card{margin-top:24px;display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:16px;background:#FFFFFF;}
  .qr-card svg{display:block;width:88px;height:88px;flex-shrink:0;}
  .qr-label{margin:0;color:var(--navy);font-size:15px;font-weight:700;line-height:1.4;}
</style>
</head>
<body>
  <div class="wrap">
    <div class="logo"><img src="/icon-192.png" alt=""><b>relief.lu</b></div>
    <h1>${name}</h1>
    ${address ? `<p class="addr">${address}</p>` : ""}
    <p>${name} lutte contre le gaspillage alimentaire au Luxembourg en proposant ses invendus à prix réduit sur relief.lu. Réservez en ligne et récupérez votre panier directement sur place.</p>
    ${renderOfferBlock(bag, rating)}
    <div class="qr-card">
      ${qrSvg}
      <p class="qr-label">Scannez pour continuer sur votre mobile</p>
    </div>
    <br>
    <a class="cta" href="${appUrl}" rel="nofollow">Voir les paniers disponibles →</a>
    <br>
    <a class="back" href="${SITE}/app.html" rel="nofollow">← Tous les commerçants relief.lu</a>
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

  const merchantIds = (merchants || []).map((m) => m.id);

  // Un seul sachet actif "en vedette" par commerçant (le plus récent) — même
  // logique de disponibilité que loadActiveBags() dans src/lib/bags.js.
  const bagByMerchant = new Map();
  if (merchantIds.length) {
    const { data: bags, error: bagsError } = await supabase
      .from("bags")
      .select("merchant_id, title, category, price_cents, original_price_cents, quantity_left, pickup_end, status, container_provided, bag_provided, vegetarian, vegan")
      .in("merchant_id", merchantIds)
      .eq("status", "active")
      .gt("quantity_left", 0)
      .gt("pickup_end", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (bagsError) {
      console.error("[generate-merchant-pages] Erreur Supabase (bags):", bagsError.message);
    } else {
      for (const bag of bags || []) {
        if (!bagByMerchant.has(bag.merchant_id)) bagByMerchant.set(bag.merchant_id, bag);
      }
    }
  }

  // Même agrégation que getMerchantRatings() (src/lib/reviews.js), limitée
  // aux commerçants de cette page et sans le détail par critère.
  const ratingByMerchant = new Map();
  if (merchantIds.length) {
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("merchant_id, rating")
      .in("merchant_id", merchantIds);
    if (reviewsError) {
      console.error("[generate-merchant-pages] Erreur Supabase (reviews):", reviewsError.message);
    } else {
      const totals = new Map();
      for (const r of reviews || []) {
        const agg = totals.get(r.merchant_id) || { sum: 0, count: 0 };
        agg.sum += r.rating;
        agg.count += 1;
        totals.set(r.merchant_id, agg);
      }
      for (const [id, agg] of totals) ratingByMerchant.set(id, { avg: agg.sum / agg.count, count: agg.count });
    }
  }

  const usedSlugs = new Set();
  const urls = [`${SITE}/`];

  for (const merchant of merchants || []) {
    let slug = slugify(`${merchant.business_name}-${merchant.city || ""}`);
    if (usedSlugs.has(slug)) slug = `${slug}-${merchant.id.slice(0, 6)}`;
    usedSlugs.add(slug);

    const dir = resolve(DIST, "commercant", slug);
    mkdirSync(dir, { recursive: true });
    const bag = bagByMerchant.get(merchant.id) || null;
    const rating = ratingByMerchant.get(merchant.id) || null;
    // SVG inline (pas de fichier image à part) : scanner ce QR depuis le
    // même lien "Voir les paniers disponibles" fait basculer un visiteur
    // desktop directement vers l'app sur son mobile, sans taper d'URL.
    const qrSvg = await QRCode.toString(`${SITE}/app.html?merchant=${merchant.id}`, {
      type: "svg",
      margin: 0,
      color: { dark: "#16232C", light: "#FFFFFF" },
    });
    writeFileSync(resolve(dir, "index.html"), renderPage(merchant, slug, bag, rating, qrSvg));
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
