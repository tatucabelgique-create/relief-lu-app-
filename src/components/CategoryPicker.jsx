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
// Parcourir. Sélection unique (un sachet n'a qu'une catégorie) : un nouveau
// tap sur l'item déjà actif le désélectionne. "Appliquer" ferme la feuille,
// "Effacer les filtres" retire le filtre et ferme.
export default function CategoryPicker({ category, setCategory, onClose }) {
  const { t } = useI18n();
  return (
    <div className="location-sheet-overlay" onClick={onClose}>
      <div className="location-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="location-sheet-handle" />
        <h2>{t("category.title")}</h2>

        <div className="category-sheet-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`category-sheet-item ${category === c.value ? "active" : ""}`}
              onClick={() => setCategory(category === c.value ? "" : c.value)}
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
              setCategory("");
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
