import { useEffect, useRef, useState } from "react";
import { searchPlaces } from "../lib/geolocation";

// Champ de recherche avec suggestions de lieux (façon TGTG) — remplace un
// <input type="text"> classique dans PublicView.jsx (vue carte) et
// FiltersBar.jsx (vue grille). Débounce les requêtes à l'API Photon
// (gratuite, pas de clé) plutôt que d'appeler à chaque frappe, et laisse le
// filtre texte existant en repli si aucune suggestion n'est choisie.
export default function CitySearchInput({ value, onChange, onSelectPlace, onKeyDown, placeholder, className }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value?.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchPlaces(value);
      setSuggestions(results);
      setOpen(results.length > 0);
      setHighlighted(-1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  // Ferme la liste au clic en dehors — même pattern que les autres menus
  // déroulants du site (voir le menu "À propos" de index.html).
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(s) {
    onChange(s.label);
    onSelectPlace({ lat: s.lat, lng: s.lng });
    setOpen(false);
    setSuggestions([]);
  }

  function handleInputKeyDown(e) {
    if (open && suggestions.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && highlighted >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlighted]);
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
    }
    onKeyDown?.(e);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1 }}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleInputKeyDown}
        onFocus={() => suggestions.length && setOpen(true)}
        style={{ width: "100%" }}
        autoComplete="off"
      />
      {open && (
        <div className="city-suggestions">
          {suggestions.map((s, i) => (
            <button
              type="button"
              key={`${s.lat}-${s.lng}-${i}`}
              className={`city-suggestion ${i === highlighted ? "highlighted" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(s)}
            >
              📍 {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
