import { useI18n } from "../lib/i18n.jsx";
import CitySearchInput from "./CitySearchInput.jsx";

const CATEGORIES = ["boulangerie", "restaurant", "epicerie", "supermarche", "traiteur", "autre"];

export default function FiltersBar({ category, setCategory, sort, setSort, search, setSearch, onSearchSubmit, onSelectPlace, onLocate, geoStatus, viewMode, setViewMode }) {
  const { t } = useI18n();
  return (
    <div className="filters-bar">
      <CitySearchInput
        placeholder={t("filters.search")}
        value={search}
        onChange={setSearch}
        onSelectPlace={onSelectPlace}
        onKeyDown={onSearchSubmit}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">{t("filters.allCategories")}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`merchant.category.${c}`)}
          </option>
        ))}
      </select>
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="recent">{t("filters.sortRecent")}</option>
        <option value="price">{t("filters.sortPrice")}</option>
        <option value="distance">{t("filters.sortDistance")}</option>
      </select>
      <button className="btn secondary small" onClick={onLocate}>
        {geoStatus === "loading" ? t("filters.locating") : t("filters.useLocation")}
      </button>
      <button className="btn secondary small" onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}>
        {viewMode === "grid" ? t("filters.showMap") : t("filters.showGrid")}
      </button>
    </div>
  );
}
