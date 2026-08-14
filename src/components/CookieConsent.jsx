import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadAnalytics } from "../lib/analytics";

const STORAGE_KEY = "relief_cookie_consent"; // "accepted" | "declined"

// Bandeau de consentement — n'apparaît que parce que Google Analytics et
// Meta Pixel sont utilisés (cookies non-essentiels, consentement requis).
// Les scripts ne se chargent jamais avant un clic explicite sur "Accepter".
export default function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted") loadAnalytics();
    else if (saved !== "declined") setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    loadAnalytics();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>{t("cookies.bannerText")}</p>
      <div className="cookie-banner-actions">
        <button className="btn secondary small" onClick={decline}>
          {t("cookies.decline")}
        </button>
        <button className="btn small" onClick={accept}>
          {t("cookies.accept")}
        </button>
      </div>
    </div>
  );
}

// Utilisé par le lien "Gérer les cookies" du pied de page — remet le choix
// à zéro et recharge, pour que le bandeau redemande explicitement.
export function reopenCookieConsent() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
