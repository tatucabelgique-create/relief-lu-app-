import { useI18n } from "../lib/i18n.jsx";
import { logout } from "../lib/auth";
import { isRegistrationComplete } from "../lib/merchants";
import { ADMIN_EMAIL } from "../lib/admin";

export default function Header({ view, user, merchant, onNavigate }) {
  const { lang, setLang, t } = useI18n();
  const isMerchant = isRegistrationComplete(merchant);
  return (
    <>
      {/* Bandeau plein-largeur, présent sur toutes les pages tant qu'on est
          connecté en tant que commerçant inscrit — inspiré du fait que TGTG
          fait tourner l'espace pro dans un portail à part entier, jamais
          juste un lien parmi d'autres dans la nav client. Le simple badge
          dans les pills était trop discret (noyé sur mobile) pour vraiment
          lever l'ambiguïté rapportée. */}
      {isMerchant && (
        <div className="merchant-mode-strip">
          <span>🏪 {t("nav.merchantModeLabel")} — {merchant.business_name}</span>
          <button
            className="link-btn"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(view === "merchant" ? "public" : "merchant");
            }}
          >
            {view === "merchant" ? t("nav.viewAsCustomer") : t("nav.manageMyShop")}
          </button>
        </div>
      )}
      <header>
        <a
          href="#"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            onNavigate("public");
          }}
        >
          relief<span>.lu</span>
        </a>
        <div className="head-right">
          <div className="langs">
            {["fr", "de", "en"].map((l) => (
              <button key={l} className={lang === l ? "active" : ""} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {user?.email === ADMIN_EMAIL && (
            <button className="btn secondary small" onClick={() => onNavigate("admin")}>
              Admin
            </button>
          )}
          {user && (
            <button className="btn secondary small" onClick={logout}>
              {t("account.logout")}
            </button>
          )}
        </div>
      </header>
    </>
  );
}
