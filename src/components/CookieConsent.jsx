import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadAnalytics } from "../lib/analytics";

const STORAGE_KEY = "relief_cookie_consent"; // "accepted" | "declined"

// Bandeau détaillé façon TGTG (logo, cookies obligatoires vs optionnels avec
// interrupteurs, "Autoriser la sélection" / "Tout autoriser") — remplace
// l'ancien petit bandeau bas de page à deux boutons. N'apparaît que parce que
// Google Analytics et Meta Pixel sont utilisés (cookies non-essentiels,
// consentement requis) ; les scripts ne se chargent jamais avant un choix
// explicite de l'utilisateur.
export default function CookieConsent({ onOpenLegal }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted") loadAnalytics();
    else if (saved !== "declined") setVisible(true);
  }, []);

  function save(marketingEnabled) {
    localStorage.setItem(STORAGE_KEY, marketingEnabled ? "accepted" : "declined");
    if (marketingEnabled) loadAnalytics();
    setVisible(false);
  }

  function openLegal(type) {
    setVisible(false);
    onOpenLegal?.(type);
  }

  if (!visible) return null;

  return (
    <div className="overlay open">
      <div className="modal cookie-modal" style={{ maxHeight: "85vh", overflowY: "auto" }}>
        <div className="cookie-modal-logo">
          <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="relief.lu" />
        </div>
        <p className="desc" style={{ textAlign: "center" }}>
          {t("cookies.intro")}
        </p>

        <div className="divider" />
        <h3 className="cookie-section-title">{t("cookies.requiredTitle")}</h3>
        <div className="cookie-toggle-row">
          <span>{t("cookies.requiredLabel")}</span>
          <span className="toggle-switch on disabled" aria-hidden="true">
            <span className="toggle-knob" />
          </span>
        </div>
        <p className="cookie-section-text">{t("cookies.requiredText")}</p>

        <div className="divider" />
        <h3 className="cookie-section-title">{t("cookies.optionalTitle")}</h3>
        <div className="cookie-toggle-row">
          <span>{t("cookies.marketingLabel")}</span>
          <button className={`toggle-switch ${marketing ? "on" : ""}`} onClick={() => setMarketing((v) => !v)} aria-label="marketing">
            <span className="toggle-knob" />
          </button>
        </div>
        <p className="cookie-section-text">{t("cookies.marketingText")}</p>

        <p className="cookie-modal-footnote">
          {t("cookies.footnote")}{" "}
          <button className="link-btn" onClick={() => openLegal("cookies")}>
            {t("cookies.linkCookies")}
          </button>{" "}
          {t("cookies.and")}{" "}
          <button className="link-btn" onClick={() => openLegal("confidentialite")}>
            {t("cookies.linkPrivacy")}
          </button>
          .
        </p>

        <div className="cookie-modal-actions">
          <button className="btn secondary" onClick={() => save(marketing)}>
            {t("cookies.selectionBtn")}
          </button>
          <button className="btn" onClick={() => save(true)}>
            {t("cookies.acceptAllBtn")}
          </button>
        </div>
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
