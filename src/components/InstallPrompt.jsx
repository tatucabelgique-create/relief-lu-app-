import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";

const DISMISS_KEY = "relief_install_dismissed";
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

// Bandeau discret d'invitation à l'installation PWA — se redéclenche
// périodiquement (à chaque paiement confirmé, voir l'événement
// "relief:engaged" dispatché par PaymentResult.jsx) tant que l'app n'est
// pas installée, plutôt qu'une seule fois par utilisateur : quelqu'un qui
// ignore le bandeau une fois n'est pas forcément fermé à l'idée plus tard.
// Le cooldown de 14 jours après un rejet explicite évite juste d'insister
// à chaque réservation.
export default function InstallPrompt() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    if (isStandalone) return;

    function handleEngaged() {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < COOLDOWN_MS) return;
      setShow(true);
    }
    window.addEventListener("relief:engaged", handleEngaged);
    return () => window.removeEventListener("relief:engaged", handleEngaged);
  }, [isStandalone]);

  if (isStandalone || !show) return null;

  function dismiss() {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  return (
    <div className={`install-nudge ${show ? "show" : ""}`}>
      <div className="ic">📲</div>
      <div className="txt">
        <b>{t("install.title")}</b>
        {isIOS ? t("install.textIOS") : t("install.textOther")}
      </div>
      <button className="close" onClick={dismiss} aria-label="Fermer">
        ✕
      </button>
    </div>
  );
}

// Appelé par PaymentResult.jsx dès qu'un paiement est confirmé — le seul
// signal d'engagement assez fort pour justifier de proposer l'installation.
export function notifyEngaged() {
  window.dispatchEvent(new Event("relief:engaged"));
}
