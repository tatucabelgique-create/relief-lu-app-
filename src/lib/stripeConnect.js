import { supabase } from "./supabase";

// Le nom réel de la fonction déployée dans le dashboard Supabase (peut différer
// du nom du dossier source si renommée au déploiement — voir payments.js/notify.js).
// À mettre à jour après le premier déploiement de create-connect-account.
const CONNECT_FUNCTION_NAME = "create-connect-account";

// Crée le compte Stripe Connect du commerçant si besoin, et renvoie l'URL
// d'onboarding hébergée par Stripe (IBAN/identité — rien ne transite par
// relief.lu). Voir supabase/functions/create-connect-account.
export async function getConnectOnboardingUrl() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${CONNECT_FUNCTION_NAME}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ return_base: window.location.origin + import.meta.env.BASE_URL }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur de connexion Stripe.");
  return data.url;
}
