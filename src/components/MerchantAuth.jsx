import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { sendMagicLink, verifyOtpCode, getErrorMessage } from "../lib/auth";

export default function MerchantAuth({ onOpenLegal }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSend() {
    try {
      await sendMagicLink(email.trim(), "merchant");
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
    <div className="merchant-hero">
      <div className="merchant-visual">
        <div className="merchant-visual-icon">🥡</div>
      </div>
      <div className="merchant-form-panel">
        <h2>{t("merchant.registerTitle")}</h2>
        <p className="page-sub">{t("merchant.registerDesc")}</p>
        <div className="field">
          <label>{t("merchant.emailLabel")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@commerce.lu" />
        </div>
        <p className="legal-consent">
          {t("merchant.consentPrefix")}{" "}
          <button type="button" className="link-btn" onClick={() => onOpenLegal?.("cguCommercants")}>
            {t("legal.cguCommercants")}
          </button>{" "}
          {t("merchant.consentAnd")}{" "}
          <button type="button" className="link-btn" onClick={() => onOpenLegal?.("confidentialite")}>
            {t("legal.confidentialite")}
          </button>
          .
        </p>
        <button className="btn" onClick={handleSend}>
          {t("merchant.sendLink")}
        </button>
        {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
        {sent && (
          <div className="field" style={{ marginTop: 18 }}>
            <label>{t("account.codeLabel")}</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" inputMode="numeric" />
            <button className="btn secondary small" style={{ marginTop: 8 }} onClick={handleVerifyCode}>
              {t("account.verifyCode")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
