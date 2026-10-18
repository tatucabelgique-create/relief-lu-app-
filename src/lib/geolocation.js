const STORAGE_KEY = "relief-user-position";

// Villes du Luxembourg — repli si la géolocalisation est refusée ou indisponible.
export const REFERENCE_POINTS = [
  { key: "luxembourg", label: "Luxembourg-Ville", lat: 49.6117, lng: 6.1319 },
  { key: "esch", label: "Esch-sur-Alzette", lat: 49.4958, lng: 5.9806 },
  { key: "dudelange", label: "Dudelange", lat: 49.4794, lng: 6.0864 },
  { key: "differdange", label: "Differdange", lat: 49.5244, lng: 5.8917 },
  { key: "ettelbruck", label: "Ettelbruck", lat: 49.8486, lng: 6.105 },
  { key: "wiltz", label: "Wiltz", lat: 49.9667, lng: 5.9333 },
  { key: "grevenmacher", label: "Grevenmacher", lat: 49.6797, lng: 6.4408 },
  { key: "remich", label: "Remich", lat: 49.5453, lng: 6.3667 },
  { key: "echternach", label: "Echternach", lat: 49.8117, lng: 6.4181 },
];

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function loadSavedPosition() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function savePosition(pos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
}

// Géocodage via Nominatim (OpenStreetMap) — gratuit, sans clé API, cohérent
// avec les tuiles OSM déjà utilisées pour les cartes. Retourne null si
// aucune correspondance (le commerçant garde alors juste son adresse texte,
// sans coordonnées — pas bloquant pour publier des sachets).
export async function geocodeAddress(address, postalCode, city) {
  const query = [address, [postalCode, city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const results = await res.json();
    if (!results?.length) return null;
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

// Géocodage via Photon (komoot.io, données OpenStreetMap) plutôt que
// Nominatim — CORS activé pour un appel direct depuis le navigateur, contrairement
// à Nominatim (utilisé ci-dessus pour geocodeAddress, un usage serveur-side
// différent : géocoder l'adresse d'un commerçant à l'inscription). Biaisé sur
// le Luxembourg (lat/lon de centrage) sans filtre strict de pays. Dédié au
// sélecteur de lieu (LocationPicker.jsx) — ne pas réutiliser pour la
// recherche mots-clés de l'onglet Parcourir, qui reste un filtre texte simple.
export async function searchPlaces(query) {
  if (!query?.trim()) return [];
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?limit=6&lat=49.75&lon=6.15&zoom=10&lang=fr&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    const seen = new Set();
    return (data.features || [])
      .map((f) => {
        const [lng, lat] = f.geometry.coordinates;
        const p = f.properties || {};
        const label = [p.name, p.name !== p.city ? p.city : null].filter(Boolean).join(", ");
        return label ? { label, lat, lng } : null;
      })
      .filter((s) => {
        if (!s || seen.has(s.label)) return false;
        seen.add(s.label);
        return true;
      });
  } catch {
    return [];
  }
}

// Géocodage inverse (coordonnées → nom de lieu lisible), via le même
// Photon que searchPlaces — sert à afficher "Cap d'Agde, Agde" façon TGTG
// à côté du bouton "Position actuelle" après une géolocalisation GPS (qui
// ne renvoie que des coordonnées, jamais de nom). Retourne null plutôt que
// de planter si Photon échoue — le bouton retombe alors sur le libellé
// générique existant.
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&lang=fr`);
    const data = await res.json();
    const p = data.features?.[0]?.properties;
    if (!p) return null;
    return [p.name, p.name !== p.city ? p.city : null].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}

export function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        savePosition(p);
        resolve(p);
      },
      () => reject(new Error("denied")),
      { timeout: 8000 }
    );
  });
}
