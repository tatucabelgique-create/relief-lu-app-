import { useI18n } from "../lib/i18n.jsx";
import { isToday } from "./BagCard.jsx";

// Reprend les 6 catégories TGTG (menu "Catégorie" de Parcourir, sans Fleurs
// & plantes qui n'a pas d'équivalent chez relief) + 2 dimensions à part :
// "À récupérer maintenant" réutilise le filtre pickupTime existant (créneau
// du jour, calculé en direct — jamais une valeur figée en base) ; chez TGTG
// comme ici, le régime (végétarien) est un filtre indépendant de la
// catégorie, pas une des 6 valeurs.
const ITEMS = [
  { key: "repas", emoji: "🍲", labelKey: "discover.repas", filter: "category", value: "plats_prepares" },
  { key: "boulangerie", emoji: "🥐", labelKey: "merchant.category.boulangerie", filter: "category", value: "boulangerie" },
  { key: "sushi", emoji: "🍣", labelKey: "discover.sushi", filter: "category", value: "sushi" },
  { key: "epicerie", emoji: "🥬", labelKey: "merchant.category.epicerie", filter: "category", value: "epicerie" },
  { key: "sandwichs", emoji: "🥪", labelKey: "discover.sandwichs", filter: "category", value: "sandwichs" },
  { key: "pickupNow", emoji: "⏳", labelKey: "discover.pickupNow", filter: "pickup", value: "today" },
  { key: "snacks", emoji: "🍫", labelKey: "discover.snacks", filter: "snack" },
  { key: "vegetarien", emoji: "🌱", labelKey: "diet.vegetarian", filter: "diet", value: "vegetarian" },
];

function isAvailable(item, bags) {
  if (item.filter === "category") return bags.some((b) => b.category === item.value);
  if (item.filter === "diet") return bags.some((b) => b.vegetarian);
  if (item.filter === "pickup") return bags.some((b) => isToday(b.pickup_start));
  if (item.filter === "snack") return bags.some((b) => b.snack);
  return false;
}

function isActive(item, { category, diet, pickupTime, snackOnly }) {
  if (item.filter === "category") return category === item.value;
  if (item.filter === "diet") return diet === item.value;
  if (item.filter === "pickup") return pickupTime === item.value;
  if (item.filter === "snack") return snackOnly;
  return false;
}

// Rangée de catégories façon TGTG, en haut de l'onglet Découvrir. Un
// deuxième clic sur l'item déjà actif le désélectionne (toggle), comme sur
// TGTG. Ne propose que les items ayant au moins un sachet actif
// correspondant maintenant (voir isAvailable) — plutôt que de toujours
// afficher les 6, ce qui mènerait parfois vers une liste vide et trompeuse.
export default function CategoryIconRow({
  category,
  setCategory,
  diet,
  setDiet,
  pickupTime,
  setPickupTime,
  snackOnly,
  setSnackOnly,
  bags,
}) {
  const { t } = useI18n();
  const state = { category, diet, pickupTime, snackOnly };
  const visibleItems = ITEMS.filter((item) => isAvailable(item, bags ?? []));
  if (!visibleItems.length) return null;

  function handleClick(item) {
    const active = isActive(item, state);
    if (item.filter === "snack") {
      setSnackOnly(!active);
    } else {
      const setters = { category: setCategory, diet: setDiet, pickup: setPickupTime };
      setters[item.filter](active ? "" : item.value);
    }
    if (!active) {
      document.getElementById("discover-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="category-icon-row">
      {visibleItems.map((item) => (
        <button
          key={item.key}
          className={`category-icon-item ${isActive(item, state) ? "active" : ""}`}
          onClick={() => handleClick(item)}
        >
          <span className="category-icon-circle">{item.emoji}</span>
          <span className="category-icon-label">{t(item.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
