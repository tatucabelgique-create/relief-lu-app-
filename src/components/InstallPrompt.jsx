import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";

const DISMISS_KEY = "relief_install_dismissed";
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

// Bandeau discret d'invitation à l'installation PWA — se redéclenche
// périodiquement (à chaque ouverture du détail d'un sachet, voir
// l'événement "relief:engaged" dispatché par BagDetail.jsx) tant que
// l'app n'est pas installée, plutôt qu'une seule fois par utilisateur :
// quelqu'un qui ignore le bandeau une fois n'est pas forcément fermé à
// l'idée plus tard. Le cooldown de 14 jours après un rejet explicite
// évite juste d'insister à chaque sachet consulté.
// Un filet de 9s (voir fallbackTimer) couvre le cas où il n'y a aucun
// sachet à consulter (carte vide, démo, lancement) — sans ça le bandeau
// ne se déclencherait jamais pour ces visiteurs.
export default function InstallPrompt() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  // Chrome/Edge/Android exposent un événement natif permettant de déclencher
  // la vraie boîte de dialogue d'installation au clic — sans lui, on ne peut
  // que dire "installe" sans dire où ni comment, contrairement à iOS qui a
  // des étapes manuelles précises (pas d'installation en un clic possible).
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    if (isStandalone) return;

    function tryShow() {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < COOLDOWN_MS) return;
      setShow(true);
    }

    function handleEngaged() {
      clearTimeout(fallbackTimer);
      tryShow();
    }
    window.addEventListener("relief:engaged", handleEngaged);

    // Filet de sécurité : si aucun sachet n'est consultable (carte vide,
    // démo, zone sans commerçant), "relief:engaged" ne se déclenche jamais
    // et la bannière n'apparaîtrait sinon pas du tout. On la propose quand
    // même après un peu de navigation, pour ne pas perdre ces visiteurs.
    const fallbackTimer = setTimeout(tryShow, 9000);

    // preventDefault() empêche la mini-barre native de Chrome de s'afficher
    // en plus de notre propre bandeau — on garde l'événement pour le
    // redéclencher nous-mêmes au clic sur "Installer".
    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    function handleInstalled() {
      setShow(false);
      setDeferredPrompt(null);
    }
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener("relief:engaged", handleEngaged);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [isStandalone]);

  if (isStandalone || !show) return null;

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "accepted") setShow(false);
  }

  return (
    <div className="install-nudge">
      <div className="ic">📲</div>
      <div className="txt">
        <b>{t("install.title")}</b>
        {isIOS ? t("install.textIOS") : t("install.textOther")}
      </div>
      {!isIOS && deferredPrompt && (
        <button className="btn small" onClick={handleInstallClick}>
          {t("install.button")}
        </button>
      )}
      <button className="close" onClick={dismiss} aria-label="Fermer">
        ✕
      </button>
    </div>
  );
}

// Appelé par BagDetail.jsx à chaque ouverture du détail d'un sachet —
// signal d'engagement suffisant pour proposer l'installation, pas besoin
// d'attendre un paiement.
export function notifyEngaged() {
  window.dispatchEvent(new Event("relief:engaged"));
}
