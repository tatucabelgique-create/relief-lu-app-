// Partagé entre scripts/generate-merchant-pages.mjs (qui calcule le vrai
// slug publié) et le dashboard commerçant (qui devine son propre lien) —
// une seule implémentation pour éviter qu'elles divergent avec le temps.
export function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents (marques diacritiques après NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
