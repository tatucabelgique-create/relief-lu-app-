import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { updateMerchantProfile } from "../lib/merchants";
import { geocodeAddress } from "../lib/geolocation";

export default function MerchantRegistrationForm({ user, merchant, onDone }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    business_name: merchant?.business_name || "",
    address: merchant?.address || "",
    city: merchant?.city || "",
    phone: merchant?.phone || "",
    registration_number: merchant?.registration_number || "",
  });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setMsg(null);
    if (!form.business_name.trim() || !form.address.trim() || !form.city.trim()) {
      setMsg({ type: "error", text: t("merchant.reg.required") });
      return;
    }
    setSaving(true);
    try {
      // Géocode l'adresse tapée en coordonnées GPS automatiquement — le
      // commerçant n'a plus besoin de positionner un repère sur une carte.
      const coords = await geocodeAddress(form.address, form.city);
      await updateMerchantProfile(user.id, { ...form, lat: coords?.lat, lng: coords?.lng });
      onDone();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel">
      <h2>{t("merchant.reg.title")}</h2>
      <p className="page-sub">{t("merchant.reg.desc")}</p>

      <div className="field">
        <label>{t("merchant.reg.businessName")}</label>
        <input value={form.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder="Boulangerie Dupont" />
      </div>
      <div className="two-col">
        <div className="field">
          <label>{t("merchant.reg.address")}</label>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="12 rue de la Gare" />
        </div>
        <div className="field">
          <label>{t("merchant.reg.city")}</label>
          <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Luxembourg-Ville" />
        </div>
      </div>
      <div className="two-col">
        <div className="field">
          <label>{t("merchant.reg.phone")}</label>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+352 621 234 567" />
        </div>
        <div className="field">
          <label>{t("merchant.reg.registrationNumber")}</label>
          <input
            value={form.registration_number}
            onChange={(e) => set("registration_number", e.target.value)}
            placeholder="RCS Luxembourg B123456"
          />
        </div>
      </div>

      <button className="btn" onClick={handleSubmit} disabled={saving}>
        {t("merchant.reg.submit")}
      </button>
      {msg && <p className="error-msg">{msg.text}</p>}
    </div>
  );
}
