import { useI18n } from "../lib/i18n.jsx";

// Les 6 catégories TGTG (voir leur feuille "Catégorie" sur Parcourir),
// adaptées à ce que relief vend réellement — pas de "Fleurs & plantes"
// faute de fleuriste partenaire. "Poké bowls & sushis" anticipe la
// signature de Sushi Gourmet / Izakaya (Hana Group).
const CATEGORIES = [
  { value: "plats_prepares", emoji: "🍲" },
  { value: "boulangerie", emoji: "🥐" },
  { value: "sushi", emoji: "🍣" },
  { value: "epicerie", emoji: "🥬" },
  { value: "snack", emoji: "🍫" },
  { value: "sandwichs", emoji: "🥪" },
];

// Feuille "Catégorie" façon TGTG, ouverte depuis le chip "Catégorie" de
// Parcourir. Multi-sélection (OU logique) comme chez TGTG : on peut cocher
// plusieurs catégories pour voir les sachets de l'une OU l'autre — un
// sachet donné n'a toujours qu'une seule catégorie, mais le FILTRE peut en
// couvrir plusieurs à la fois. "Appliquer" ferme la feuille, "Effacer les
// filtres" retire toute sélection et ferme.
export default function CategoryPicker({ categories, setCategories, onClose }) {
  const { t } = useI18n();

  function toggle(value) {
    setCategories(categories.includes(value) ? categories.filter((c) => c !== value) : [...categories, value]);
  }

  return (
    <div className="location-sheet-overlay" onClick={onClose}>
      <div className="location-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="location-sheet-handle" />
        <h2>{t("category.title")}</h2>

        <div className="category-sheet-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`category-sheet-item ${categories.includes(c.value) ? "active" : ""}`}
              onClick={() => toggle(c.value)}
            >
              <span className="category-sheet-icon">{c.emoji}</span>
              <span>{t(`merchant.category.${c.value}`)}</span>
            </button>
          ))}
        </div>

        <div className="category-sheet-actions">
          <button
            className="btn secondary"
            onClick={() => {
              setCategories([]);
              onClose();
            }}
          >
            {t("category.clear")}
          </button>
          <button className="btn" onClick={onClose}>
            {t("category.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
