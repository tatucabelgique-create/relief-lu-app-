import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { sendMagicLink, verifyOtpCode, getErrorMessage } from "../lib/auth";

// Formulaire de connexion par magic link, réutilisé partout où un compte
// consommateur est requis (réservation, historique, favoris). Le code reçu
// par email est la seule option fiable pour se connecter DEPUIS une app
// installée sur l'écran d'accueil iOS — le lien ouvre Safari à côté (stockage
// isolé de l'app installée), jamais l'app elle-même.
export default function AuthPrompt({ title, description, view }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSend() {
    try {
      await sendMagicLink(email.trim(), view);
      setSent(true);
      setMsg({ type: "success", text: t("account.linkSent") });
    } catch (err) {
      setMsg({ type: "error", text: getErrorMessage(err) });
    }
  }

  async function handleVerifyCode() {
    try {
      await verifyOtpCode(email.trim(), code.trim());
    } catch (err) {
      setMsg({ type: "error", text: getErrorMessage(err) });
    }
  }

  return (
    <div>
      <h2>{title || t("account.loginTitle")}</h2>
      {description && <p className="desc">{description}</p>}
      <div className="field">
        <label>{t("account.emailLabel")}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.lu" />
      </div>
      <button className="btn" onClick={handleSend}>
        {t("account.sendLink")}
      </button>
      {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
      {sent && (
        <div className="field" style={{ marginTop: 18 }}>
          <label>{t("account.codeLabel")}</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="12345678" inputMode="numeric" />
          <button className="btn secondary small" style={{ marginTop: 8 }} onClick={handleVerifyCode}>
            {t("account.verifyCode")}
          </button>
        </div>
      )}
      <p className="auth-footnote">
        {t("account.loginDescPre")} <span className="auth-link-accent">{t("account.loginDescLink")}</span>
      </p>
    </div>
  );
}
