import { supabase } from "./supabase";

// Le nom réel de la fonction déployée dans le dashboard Supabase (peut différer
// du nom du dossier source si renommée au déploiement — voir notify.js).
const CHECKOUT_FUNCTION_NAME = "clever-handler";

export async function createCheckoutSession(reservationId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${CHECKOUT_FUNCTION_NAME}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    // On transmet l'adresse exacte de retour (BASE_URL, "/" en prod) — deviner
    // à partir du seul header Origin côté serveur perdait le bon chemin.
    body: JSON.stringify({ reservation_id: reservationId, return_base: window.location.origin + import.meta.env.BASE_URL }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur de paiement.");
  return data.url;
}
