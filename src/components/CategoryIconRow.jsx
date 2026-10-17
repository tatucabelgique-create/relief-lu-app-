import { useI18n } from "../lib/i18n.jsx";

// Émojis plutôt que des photos : cohérent avec le reste de l'app (🥡 en
// repli sur les fiches sans image, 📍 pour la position...) et pas de vraies
// photos de catégories à disposition sans en générer/choisir pour chacune.
const CATEGORIES = [
  { key: "boulangerie", emoji: "🥐" },
  { key: "restaurant", emoji: "🍽️" },
  { key: "epicerie", emoji: "🥬" },
  { key: "supermarche", emoji: "🛒" },
  { key: "traiteur", emoji: "🍱" },
  { key: "autre", emoji: "📦" },
];

// Rangée de catégories façon TGTG, en haut de l'onglet Découvrir — raccourci
// visuel vers le même filtre "category" que le menu déroulant de
// FiltersBar.jsx (état partagé, pas de logique dupliquée). Un deuxième clic
// sur la catégorie déjà sélectionnée la désélectionne (toggle), comme sur
// TGTG.
//
// `availableCategories` (Set des clés présentes dans les sachets actifs,
// calculé par PublicView.jsx) filtre la rangée : proposer une catégorie
// qui ne mène à aucun résultat serait trompeur, surtout tant que relief.lu
// a peu de sachets en ligne — mieux vaut n'afficher que ce qui existe
// vraiment maintenant, quitte à ce que la rangée soit courte.
export default function CategoryIconRow({ category, setCategory, availableCategories }) {
  const { t } = useI18n();
  const visibleCategories = CATEGORIES.filter((c) => availableCategories?.has(c.key));
  if (!visibleCategories.length) return null;

  function handleClick(key) {
    const selecting = category !== key;
    setCategory(selecting ? key : "");
    // Choisir une catégorie n'a d'effet visible qu'une fois scrollé jusqu'à
    // la grille filtrée, plus bas sous les carrousels éditoriaux — sans ce
    // scroll, le clic paraît ne rien faire. Pas de scroll en désélectionnant
    // (l'utilisateur reste où il était).
    if (selecting) {
      document.getElementById("discover-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="category-icon-row">
      {visibleCategories.map((c) => (
        <button
          key={c.key}
          className={`category-icon-item ${category === c.key ? "active" : ""}`}
          onClick={() => handleClick(c.key)}
        >
          <span className="category-icon-circle">{c.emoji}</span>
          <span className="category-icon-label">{t(`merchant.category.${c.key}`)}</span>
        </button>
      ))}
    </div>
  );
}
