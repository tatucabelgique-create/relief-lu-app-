import { useEffect, useState } from "react";
import { LangProvider } from "./lib/i18n.jsx";
import { getCurrentUser, onAuthChange, consumePendingView, applySessionFromUrlHash } from "./lib/auth";
import { getMerchantOrNull, isRegistrationComplete } from "./lib/merchants";
import Header from "./components/Header.jsx";
import BottomNav from "./components/BottomNav.jsx";
import PublicView from "./components/PublicView.jsx";
import MerchantView from "./components/MerchantView.jsx";
import AccountView from "./components/AccountView.jsx";
import FavoritesView from "./components/FavoritesView.jsx";
import LegalModal from "./components/LegalModal.jsx";
import PaymentResult from "./components/PaymentResult.jsx";
import CookieConsent, { reopenCookieConsent } from "./components/CookieConsent.jsx";
import SocialLinks from "./components/SocialLinks.jsx";

export default function App() {
  const [view, setView] = useState("public");
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [legalModal, setLegalModal] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null); // { reservationId, success }
  const [pendingReserveBagId, setPendingReserveBagId] = useState(null);
  const [authError, setAuthError] = useState(null);
  // undefined = pas encore vérifié, null = pas (encore) commerçant.
  // Récupéré ici (pas seulement dans MerchantView) pour pouvoir l'afficher
  // dans le header — sinon rien ne distingue visuellement un commerçant
  // inscrit d'un client normal une fois connecté.
  const [merchant, setMerchant] = useState(undefined);

  async function refreshMerchant(userId) {
    setMerchant(await getMerchantOrNull(userId));
  }

  // Supabase renvoie une erreur (lien expiré, déjà utilisé, scanné/consommé
  // automatiquement par un client email avant le vrai clic...) via le hash
  // ou les query params de l'URL — sans ça, l'échec est totalement silencieux
  // et l'app a juste l'air de "rester déconnectée" sans dire pourquoi.
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    const description =
      hashParams.get("error_description") || searchParams.get("error_description") || hashParams.get("error") || searchParams.get("error");
    if (description) {
      setAuthError(decodeURIComponent(description.replace(/\+/g, " ")));
      const url = new URL(window.location.href);
      url.hash = "";
      url.searchParams.delete("error");
      url.searchParams.delete("error_code");
      url.searchParams.delete("error_description");
      window.history.replaceState({}, "", url);
    }
  }, []);

  useEffect(() => {
    // Si l'onglet ciblé par le lien magique était déjà ouvert sur app.html
    // (plusieurs clics dans le même onglet), le navigateur peut mettre à jour
    // le fragment d'URL sans recharger la page — sans ça, les jetons du
    // nouveau clic ne sont jamais vus par Supabase (qui ne les lit qu'au
    // chargement initial). On les relit nous-mêmes à chaque changement.
    function handleHashChange() {
      applySessionFromUrlHash().catch((err) => console.error(err));
    }
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    // Restaure la vue d'où la demande de lien magique est partie (espace
    // commerçant, favoris, compte, ou "reserve:<id>" pour rouvrir la modale
    // de réservation du sachet précis) — sinon on retombe sur "public" après
    // le clic, puisque la vue n'est qu'un state React, pas dans l'URL.
    function handleUser(u) {
      setUser(u);
      if (u) {
        const pendingView = consumePendingView();
        if (pendingView?.startsWith("reserve:")) {
          setView("public");
          setPendingReserveBagId(pendingView.slice("reserve:".length));
        } else if (pendingView) {
          setView(pendingView);
        }
      }
    }
    getCurrentUser().then(handleUser);
    const {
      data: { subscription },
    } = onAuthChange(handleUser);
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) refreshMerchant(user.id);
    else setMerchant(undefined);
  }, [user]);

  // Ouvre directement un document légal via un lien partageable, ex: app.html?legal=cgu
  useEffect(() => {
    const legal = new URLSearchParams(window.location.search).get("legal");
    if (legal) setLegalModal(legal);
  }, []);

  // Ouvre directement une vue via un lien partageable, ex: app.html?view=merchant
  // (utilisé par le lien "Espace commerçant" de la landing page).
  useEffect(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view");
    if (requestedView) setView(requestedView);
  }, []);

  // Retour de Stripe Checkout — voir success_url/cancel_url dans
  // create-checkout-session (Edge Function).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reservationId = params.get("reservation");
    const paid = params.get("paid");
    if (reservationId && paid != null) {
      setPaymentResult({ reservationId, success: paid === "1" });
      const url = new URL(window.location.href);
      url.searchParams.delete("paid");
      url.searchParams.delete("reservation");
      window.history.replaceState({}, "", url);
    }
  }, []);

  return (
    <LangProvider>
      <div className="wrap">
        <Header view={view} user={user} merchant={merchant} onNavigate={setView} />

        {authError && (
          <div className="panel" style={{ borderColor: "var(--red)", marginBottom: 20 }}>
            <p className="error-msg" style={{ margin: 0 }}>
              Le lien de connexion n'a pas fonctionné ({authError}). Il est probablement expiré ou déjà utilisé — redemande un nouveau lien.
            </p>
            <button className="btn secondary small" style={{ marginTop: 10 }} onClick={() => setAuthError(null)}>
              ✕
            </button>
          </div>
        )}
        {view === "public" && (
          <PublicView user={user} pendingReserveBagId={pendingReserveBagId} onPendingReserveHandled={() => setPendingReserveBagId(null)} />
        )}
        {view === "browse" && (
          <PublicView
            user={user}
            pendingReserveBagId={pendingReserveBagId}
            onPendingReserveHandled={() => setPendingReserveBagId(null)}
            initialViewMode="map"
            compact
          />
        )}
        {view === "merchant" && (
          <MerchantView user={user} merchant={merchant} onMerchantChanged={() => refreshMerchant(user.id)} onOpenLegal={setLegalModal} />
        )}
        {view === "account" && <AccountView user={user} />}
        {view === "favorites" && <FavoritesView user={user} />}

        <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, padding: "30px 0" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, opacity: 0.7 }}>
            <button className="btn secondary small" onClick={() => setLegalModal("mentions")}>
              Mentions légales
            </button>
            <button className="btn secondary small" onClick={() => setLegalModal("cgu")}>
              CGU
            </button>
            <button className="btn secondary small" onClick={() => setLegalModal("confidentialite")}>
              Confidentialité
            </button>
            <button className="btn secondary small" onClick={() => setLegalModal("cookies")}>
              Cookies
            </button>
            <button className="btn secondary small" onClick={reopenCookieConsent}>
              Gérer les cookies
            </button>
          </div>
          <SocialLinks />
        </footer>
      </div>

      <BottomNav view={view} onNavigate={setView} />

      {paymentResult && (
        <PaymentResult
          reservationId={paymentResult.reservationId}
          success={paymentResult.success}
          onClose={() => setPaymentResult(null)}
        />
      )}

      <CookieConsent onOpenLegal={setLegalModal} />

      {legalModal && (
        <LegalModal
          type={legalModal}
          onClose={() => {
            setLegalModal(null);
            // Nettoie ?legal=... de l'URL — sinon un rechargement (ou la réouverture
            // de la PWA) rouvrirait la modale automatiquement, et le bouton "retour"
            // du navigateur ne ramènerait jamais à la page précédente.
            const url = new URL(window.location.href);
            url.searchParams.delete("legal");
            window.history.replaceState({}, "", url);
          }}
        />
      )}
    </LangProvider>
  );
}
