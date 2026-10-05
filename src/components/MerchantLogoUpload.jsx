import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { uploadMerchantLogo } from "../lib/merchants";

export default function MerchantLogoUpload({ user, merchant, onUpdated }) {
  const { t } = useI18n();
  const [logoUrl, setLogoUrl] = useState(merchant?.logo_url || null);
  const [msg, setMsg] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const url = await uploadMerchantLogo(user.id, file);
      setLogoUrl(url);
      onUpdated?.(url);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="panel">
      <h2>{t("merchant.logoTitle")}</h2>
      <p className="page-sub">{t("merchant.logoDesc")}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--navy-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "2px solid rgba(239,230,211,0.2)",
          }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 24 }}>🏪</span>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      </div>
      {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
    </div>
  );
}
