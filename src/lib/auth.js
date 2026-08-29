import { supabase } from "./supabase";

// La vue (public/merchant/account/favorites) n'est jamais reflétée dans l'URL
// (juste un state React) — sans ça, le clic sur le lien magique recharge la
// page et retombe toujours sur la vue par défaut, même si la demande venait
// de l'espace commerçant ou de la page favoris.
const PENDING_VIEW_KEY = "relief-pending-view";

// Envoie un lien de connexion par email — pas de mot de passe à gérer.
// Utilisé pour les commerçants comme pour les acheteurs (même mécanisme).
// `view` (optionnel) : la vue à restaurer après le clic sur le lien.
export async function sendMagicLink(email, view) {
  if (view) localStorage.setItem(PENDING_VIEW_KEY, view);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  if (error) throw error;
}

export function consumePendingView() {
  const view = localStorage.getItem(PENDING_VIEW_KEY);
  localStorage.removeItem(PENDING_VIEW_KEY);
  return view;
}

// Selon la forme exacte de l'erreur renvoyée (ex: le champ est "msg" et pas
// "message" sur certaines réponses 500 de Supabase Auth), err.message peut
// être vide — sans ça, l'UI affichait littéralement "{}" à l'utilisateur.
export function getErrorMessage(err, fallback = "Une erreur est survenue, réessaie dans un instant.") {
  return err?.message || err?.msg || err?.error_description || fallback;
}

// Alternative au clic sur le lien : saisir le code reçu par email. Utile en
// PWA installée (le lien ouvre parfois un navigateur externe sans la même session).
export async function verifyOtpCode(email, token) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, event);
  });
}

// Supabase ne lit les jetons du lien magique (#access_token=...) qu'au tout
// premier chargement de la page. Si l'onglet cible était déjà ouvert sur
// app.html (cas fréquent : plusieurs clics sur des liens différents dans le
// même onglet), le navigateur fait parfois une navigation "légère" qui met à
// jour le fragment d'URL SANS recharger la page — les jetons du nouveau clic
// n'étaient alors jamais vus. On les relit donc nous-mêmes à chaque
// changement de fragment, et on établit la session manuellement.
// Autre cas observé : plusieurs blocs de jetons collés bout à bout dans le
// même fragment (ex: "#access_token=...type=magiclink#access_token=...") —
// on ne garde que le premier bloc valide.
export async function applySessionFromUrlHash() {
  const raw = window.location.hash.replace(/^#+/, "").split("#")[0];
  const params = new URLSearchParams(raw);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return;

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState({}, "", url);
  if (error) throw error;
}

export async function logout() {
  await supabase.auth.signOut();
}
