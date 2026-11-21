import { useState } from "react";
import { updateMerchantAsAdmin, uploadMerchantLogo, uploadMerchantBanner } from "../lib/merchants";

export default function EditMerchantModal({ merchant, onClose, onSaved }) {
  const [form, setForm] = useState({
    business_name: merchant.business_name || "",
    address: merchant.address || "",
    postal_code: merchant.postal_code || "",
    city: merchant.city || "",
    phone: merchant.phone || "",
    registration_number: merchant.registration_number || "",
    email: merchant.email || "",
    commission_rate: merchant.commission_rate != null ? Math.round(merchant.commission_rate * 100) : "",
    waive_service_fee: merchant.waive_service_fee || false,
    dynamic_pricing_threshold: merchant.dynamic_pricing_threshold ?? "",
  });
  const [logoUrl, setLogoUrl] = useState(merchant.logo_url || null);
  const [bannerUrl, setBannerUrl] = useState(merchant.banner_url || null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    setError("");
    try {
      setLogoUrl(await uploadMerchantLogo(merchant.id, file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBanner(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBanner(true);
    setError("");
    try {
      setBannerUrl(await uploadMerchantBanner(merchant.id, file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSave() {
    setError("");
    if (!form.business_name.trim() || !form.address.trim()) {
      setError("Nom et adresse obligatoires.");
      return;
    }
    setSaving(true);
    try {
      await updateMerchantAsAdmin(merchant.id, {
        ...form,
        // Commission saisie en % (ex. 21) -> fraction stockée en base (0.21).
        // Champ vide = NULL = taux par défaut (18%), pas 0%.
        commission_rate: form.commission_rate === "" ? null : Number(form.commission_rate) / 100,
        dynamic_pricing_threshold: form.dynamic_pricing_threshold === "" ? null : parseInt(form.dynamic_pricing_threshold, 10),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480, maxHeight: "86vh", overflowY: "auto" }}>
        <button className="close" onClick={onClose}>✕</button>
        <h2>Modifier {merchant.business_name}</h2>

        <div className="field">
          <label>Nom du commerce</label>
          <input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} />
        </div>
        <div className="field">
          <label>Adresse</label>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="two-col">
          <div className="field">
            <label>Code postal</label>
            <input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} placeholder="L-1234" />
          </div>
          <div className="field">
            <label>Ville</label>
            <input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
        </div>
        <div className="two-col">
          <div className="field">
            <label>Téléphone</label>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="field">
            <label>N° RCS</label>
            <input value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <span className="field-hint">Affichage uniquement — ne change pas l'email de connexion du compte.</span>
        </div>

        <div className="two-col">
          <div className="field">
            <label>Commission (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.commission_rate}
              onChange={(e) => set("commission_rate", e.target.value)}
              placeholder="18 (par défaut)"
            />
          </div>
          <div className="field">
            <label>Seuil prix dynamique</label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.dynamic_pricing_threshold}
              onChange={(e) => set("dynamic_pricing_threshold", e.target.value)}
              placeholder="Désactivé"
            />
          </div>
        </div>

        <label className="checkbox-field">
          <input type="checkbox" checked={form.waive_service_fee} onChange={(e) => set("waive_service_fee", e.target.checked)} />
          Exonérer ce commerçant des frais de service côté client
        </label>

        <div className="two-col" style={{ marginTop: 10 }}>
          <div className="field">
            <label>Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", background: "var(--navy-3)", flexShrink: 0 }}>
                {logoUrl && <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <input type="file" accept="image/*" onChange={handleLogo} disabled={uploadingLogo} />
            </div>
          </div>
          <div className="field">
            <label>Bannière</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "var(--navy-3)", flexShrink: 0 }}>
                {bannerUrl && <img src={bannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <input type="file" accept="image/*" onChange={handleBanner} disabled={uploadingBanner} />
            </div>
          </div>
        </div>

        <button className="btn" style={{ marginTop: 16 }} onClick={handleSave} disabled={saving}>
          {saving ? "…" : "Enregistrer"}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}
