import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { searchPlaces } from "../lib/geolocation";
import { loadSavedPlaces, savePlace, SLOTS } from "../lib/savedPlaces";

const SLOT_ICONS = { home: "🏠", work: "💼", other: "📍" };

// Feuille "Lieu" façon TGTG : position GPS courante + jusqu'à 3 emplacements
// enregistrés (Domicile/Travail/Autre), plus une recherche libre pour un
// lieu ponctuel. `onSelect(pos)` reçoit {lat,lng} et ferme la feuille —
// c'est à PublicView.jsx de décider quoi en faire (userPos, handleLocate...).
export default function LocationPicker({ onSelect, onLocate, onClose }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  // Slot en cours d'assignation ("home"/"work"/"other") quand on clique
  // "Ajouter" — les résultats de recherche suivants s'enregistrent sur ce
  // slot au lieu de juste sélectionner un lieu ponctuel.
  const [assigningSlot, setAssigningSlot] = useState(null);
  const [places, setPlaces] = useState(() => loadSavedPlaces());
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setResults(await searchPlaces(query));
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handlePickResult(place) {
    if (assigningSlot) {
      savePlace(assigningSlot, place);
      setPlaces(loadSavedPlaces());
      setAssigningSlot(null);
      setQuery("");
      setResults([]);
      return;
    }
    onSelect({ lat: place.lat, lng: place.lng }, place.label);
  }

  function handleAddSlot(slot) {
    setAssigningSlot(slot);
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }

  function handleSlotClick(slot) {
    const place = places[slot];
    if (!place) {
      handleAddSlot(slot);
      return;
    }
    onSelect({ lat: place.lat, lng: place.lng }, place.label);
  }

  return (
    <div className="location-sheet-overlay" onClick={onClose}>
      <div className="location-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="location-sheet-handle" />
        <h2>{t("location.title")}</h2>

        <div className="location-search-field">
          <span className="location-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={assigningSlot ? t(`location.${assigningSlot}`) : t("location.searchPlaceholder")}
          />
        </div>

        {query.trim() && (
          <div className="location-results">
            {searching && <div className="location-row location-row-muted">…</div>}
            {!searching &&
              results.map((r) => (
                <button key={r.label} className="location-row" onClick={() => handlePickResult(r)}>
                  <span className="location-row-icon">📍</span>
                  <span className="location-row-label">{r.label}</span>
                </button>
              ))}
            {!searching && !results.length && <div className="location-row location-row-muted">{t("location.noResults")}</div>}
          </div>
        )}

        {!query.trim() && (
          <div className="location-list">
            <button
              className="location-row"
              onClick={() => {
                onLocate();
                onClose();
              }}
            >
              <span className="location-row-icon">🧭</span>
              <span className="location-row-label">{t("location.currentPosition")}</span>
              <span className="location-row-dot" />
            </button>
            {SLOTS.map((slot) => (
              <button key={slot} className="location-row" onClick={() => handleSlotClick(slot)}>
                <span className="location-row-icon">{SLOT_ICONS[slot]}</span>
                <span className="location-row-label">
                  {t(`location.${slot}`)}
                  {places[slot] && <span className="location-row-sub">{places[slot].label}</span>}
                </span>
                {!places[slot] && <span className="location-row-add">{t("location.add")}</span>}
              </button>
            ))}
          </div>
        )}

        <button className="location-sheet-close" onClick={onClose}>
          {t("location.close")}
        </button>
      </div>
    </div>
  );
}
