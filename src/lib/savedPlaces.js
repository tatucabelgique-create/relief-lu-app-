// Lieux enregistrés par l'utilisateur (Domicile/Travail/Autre, façon TGTG) —
// stockés en local uniquement, comme la position courante (geolocation.js) :
// pas de compte nécessaire, pas de synchronisation entre appareils pour
// l'instant.
const STORAGE_KEY = "relief-saved-places";

export const SLOTS = ["home", "work", "other"];

export function loadSavedPlaces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// `place` : { label, lat, lng } — ou null pour effacer un emplacement.
export function savePlace(slot, place) {
  const places = loadSavedPlaces();
  if (place) places[slot] = place;
  else delete places[slot];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}
