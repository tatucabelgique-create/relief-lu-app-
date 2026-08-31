import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { updateMerchantProfile } from "../lib/merchants";
import { geocodeAddress } from "../lib/geolocation";
import { LUXEMBOURG_CITIES } from "../lib/cities";

export default function MerchantRegistrationForm({ user, merchant, onDone }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    business_name: merchant?.business_name || "",
    address: merchant?.address || "",
    city: merchant?.city || "",
    phone: merchant?.phone || "",
    registration_number: merchant?.registration_number || "",
    dynamic_pricing_threshold: merchant?.dynamic_pricing_threshold ?? "",
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
      await updateMerchantProfile(user.id, {
        ...form,
        lat: coords?.lat,
        lng: coords?.lng,
        // Chaîne vide = désactivé (NULL en base), pas 0 — un seuil de 0
        // déclencherait le prix dynamique dès la première vente.
        dynamic_pricing_threshold: form.dynamic_pricing_threshold === "" ? null : parseInt(form.dynamic_pricing_threshold, 10),
      });
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
          <select value={form.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">{t("merchant.reg.cityPlaceholder")}</option>
            {LUXEMBOURG_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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

      <div className="field">
        <label>{t("merchant.reg.dynamicThreshold")}</label>
        <input
          type="number"
          min="1"
          step="1"
          value={form.dynamic_pricing_threshold}
          onChange={(e) => set("dynamic_pricing_threshold", e.target.value)}
          placeholder={t("merchant.reg.dynamicThresholdPlaceholder")}
        />
        <span className="field-hint">{t("merchant.reg.dynamicThresholdHint")}</span>
      </div>

      <button className="btn" onClick={handleSubmit} disabled={saving}>
        {t("merchant.reg.submit")}
      </button>
      {msg && <p className="error-msg">{msg.text}</p>}
    </div>
  );
}
