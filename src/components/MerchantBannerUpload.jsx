import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { uploadMerchantBanner } from "../lib/merchants";

export default function MerchantBannerUpload({ user, merchant, onUpdated }) {
  const { t } = useI18n();
  const [bannerUrl, setBannerUrl] = useState(merchant?.banner_url || null);
  const [msg, setMsg] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const url = await uploadMerchantBanner(user.id, file);
      setBannerUrl(url);
      onUpdated?.(url);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="panel">
      <h2>{t("merchant.bannerTitle")}</h2>
      <p className="page-sub">{t("merchant.bannerDesc")}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            width: "100%",
            maxWidth: 320,
            height: 150,
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--navy-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(239,230,211,0.2)",
          }}
        >
          {bannerUrl ? (
            <img src={bannerUrl} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 30 }}>🥡</span>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      </div>
      {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
    </div>
  );
}
