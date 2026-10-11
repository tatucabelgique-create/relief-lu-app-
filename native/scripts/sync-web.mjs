// Prépare native/www/ à partir du build web (dist/) produit à la racine
// du projet. Capacitor charge toujours "index.html" depuis webDir — or
// app.html (la vraie PWA) n'est pas index.html (la page vitrine du site).
// On copie donc app.html renommé en index.html, plus les assets Vite
// hashés dont il dépend.
import { existsSync, mkdirSync, cpSync, copyFileSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const DIST = resolve(ROOT, "dist");
const WWW = resolve(__dirname, "..", "www");

if (!existsSync(DIST) || !existsSync(resolve(DIST, "app.html"))) {
  console.error(
    "dist/app.html introuvable. Lance d'abord `npm run build` à la racine du projet."
  );
  process.exit(1);
}

rmSync(WWW, { recursive: true, force: true });
mkdirSync(WWW, { recursive: true });

copyFileSync(resolve(DIST, "app.html"), resolve(WWW, "index.html"));

const distAssets = resolve(DIST, "assets");
if (existsSync(distAssets)) {
  cpSync(distAssets, resolve(WWW, "assets"), { recursive: true });
}

// manifest.json et icônes, utiles pour la cohérence visuelle même si le
// shell natif ne s'en sert pas de la même façon qu'un vrai navigateur.
for (const file of ["manifest.json", "icon-192.png", "icon-512.png"]) {
  const src = resolve(DIST, file);
  if (existsSync(src)) copyFileSync(src, resolve(WWW, file));
}

console.log(`www/ prêt (${WWW}) — app.html copié en index.html.`);
