import { useI18n } from "../lib/i18n.jsx";

export default function FiltersBar({ sort, setSort, search, setSearch, onLocate, geoStatus, viewMode, setViewMode }) {
  const { t } = useI18n();
  return (
    <div className="filters-bar">
      <input
        type="text"
        placeholder={t("filters.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
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
