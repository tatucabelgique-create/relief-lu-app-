import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadMerchantBags, publishBag, uploadBagPhoto } from "../lib/bags";
import { notifyNewBag } from "../lib/notify";
import { getErrorMessage } from "../lib/auth";
import MerchantLocationPicker from "./MerchantLocationPicker.jsx";
import MerchantLogoUpload from "./MerchantLogoUpload.jsx";
import MerchantStats from "./MerchantStats.jsx";
import MerchantBagRow from "./MerchantBagRow.jsx";

const emptyForm = {
  title: "",
  category: "boulangerie",
  desc: "",
  originalPrice: "",
  price: 4,
  qty: 5,
  start: "",
  end: "",
  recurring: false,
  containerProvided: false,
  bagProvided: false,
};

export default function MerchantDashboard({ user, merchant, onMerchantChanged }) {
  const { t } = useI18n();
  const [form, setForm] = useState(emptyForm);
  const [priceTouched, setPriceTouched] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState(null);
  const [myBags, setMyBags] = useState([]);
  const [statsKey, setStatsKey] = useState(0);

  async function refreshMyBags() {
    setMyBags(await loadMerchantBags(user.id));
    setStatsKey((k) => k + 1);
  }

  useEffect(() => {
    refreshMyBags();
  }, [user.id]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Le prix réduit se calcule automatiquement à -50% du prix normal tant que
  // le commerçant n'a pas modifié ce champ lui-même — sitôt qu'il y touche,
  // on respecte son choix et on arrête de l'écraser.
  function setOriginalPrice(value) {
    setForm((f) => ({
      ...f,
      originalPrice: value,
      price: priceTouched ? f.price : value ? (parseFloat(value) / 2).toFixed(2) : f.price,
    }));
  }

  function setPrice(value) {
    setPriceTouched(true);
    set("price", value);
  }

  async function handlePublish() {
    setMsg(null);
    if (!form.title || !form.start || !form.end) {
      setMsg({ type: "error", text: "Titre et créneau de retrait sont obligatoires." });
      return;
    }
    if (new Date(form.end) <= new Date(form.start)) {
      setMsg({ type: "error", text: "Le retrait « jusqu'à » doit être après le retrait « à partir de »." });
      return;
    }
    // La photo est un plus, pas une condition pour publier — si son envoi
    // échoue (réseau, format...), le sachet part quand même sans elle plutôt
    // que de bloquer toute la publication pour un problème secondaire.
    let image_url = null;
    let photoFailed = false;
    if (photo) {
      try {
        image_url = await uploadBagPhoto(user.id, photo);
      } catch {
        photoFailed = true;
      }
    }

    try {
      const newBag = await publishBag({
        merchant_id: user.id,
        title: form.title.trim(),
        category: form.category,
        description: form.desc.trim(),
        price_cents: Math.round(parseFloat(form.price || "0") * 100),
        original_price_cents: form.originalPrice ? Math.round(parseFloat(form.originalPrice) * 100) : null,
        quantity_total: parseInt(form.qty || "1", 10),
        quantity_left: parseInt(form.qty || "1", 10),
        pickup_start: form.start,
        pickup_end: form.end,
        is_recurring: form.recurring,
        container_provided: form.containerProvided,
        bag_provided: form.bagProvided,
        image_url,
      });
      notifyNewBag(newBag);
      setMsg(
        photoFailed
          ? { type: "success", text: "Sachet publié ! (la photo n'a pas pu être envoyée — réessaie avec une autre photo si besoin)" }
          : { type: "success", text: "Sachet publié !" }
      );
      setForm(emptyForm);
      setPriceTouched(false);
      setPhoto(null);
      refreshMyBags();
    } catch (err) {
      setMsg({ type: "error", text: getErrorMessage(err) });
    }
  }

  return (
    <>
      <div className="panel">
        <MerchantStats merchantId={user.id} refreshKey={statsKey} />
      </div>

      {merchant && <MerchantLogoUpload user={user} merchant={merchant} onUpdated={onMerchantChanged} />}
      {merchant && <MerchantLocationPicker user={user} merchant={merchant} />}

      <div className="panel">
        <h2>{t("merchant.newBag")}</h2>
        <div className="two-col">
          <div className="field">
            <label>{t("merchant.f.title")}</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Panier boulangerie du soir" />
          </div>
          <div className="field">
            <label>{t("merchant.f.category")}</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="boulangerie">Boulangerie</option>
              <option value="restaurant">Restaurant</option>
              <option value="epicerie">Épicerie</option>
              <option value="supermarche">Supermarché</option>
              <option value="traiteur">Traiteur / cantine</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>{t("merchant.f.desc")}</label>
          <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Ce que contient le sachet, en général" />
        </div>
        <div className="two-col">
          <div className="field">
            <label>{t("merchant.f.originalPrice")}</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={form.originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder={t("merchant.f.originalPricePlaceholder")}
            />
            <span className="field-hint">{t("merchant.f.originalPriceHint")}</span>
          </div>
          <div className="field">
            <label>{t("merchant.f.price")}</label>
            <input type="number" min="1" step="0.5" value={form.price} onChange={(e) => setPrice(e.target.value)} />
            <span className="field-hint">{t("merchant.f.priceHint")}</span>
          </div>
        </div>
        <div className="two-col">
          <div className="field">
            <label>{t("merchant.f.qty")}</label>
            <input type="number" min="1" step="1" value={form.qty} onChange={(e) => set("qty", e.target.value)} />
          </div>
        </div>
        <div className="two-col">
          <div className="field">
            <label>{t("merchant.f.start")}</label>
            <input type="datetime-local" value={form.start} onChange={(e) => set("start", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("merchant.f.end")}</label>
            <input type="datetime-local" value={form.end} onChange={(e) => set("end", e.target.value)} />
          </div>
        </div>
        <label className="checkbox-field">
          <input type="checkbox" checked={form.recurring} onChange={(e) => set("recurring", e.target.checked)} />
          <span>
            {t("merchant.f.recurring")}
            <span className="field-hint" style={{ display: "block" }}>{t("merchant.f.recurringHint")}</span>
          </span>
        </label>

        <label className="checkbox-field">
          <input type="checkbox" checked={form.containerProvided} onChange={(e) => set("containerProvided", e.target.checked)} />
          <span>{t("merchant.f.containerProvided")}</span>
        </label>

        <label className="checkbox-field">
          <input type="checkbox" checked={form.bagProvided} onChange={(e) => set("bagProvided", e.target.checked)} />
          <span>{t("merchant.f.bagProvided")}</span>
        </label>

        <div className="field">
          <label>{t("merchant.f.photo")}</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0] || null)} />
        </div>
        <button className="btn" onClick={handlePublish}>
          {t("merchant.publish")}
        </button>
        {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
      </div>

      <div className="panel">
        <h2>{t("merchant.mine")}</h2>
        {!myBags.length ? (
          <span className="page-sub">{t("merchant.none")}</span>
        ) : (
          myBags.map((b) => <MerchantBagRow key={b.id} bag={b} onChanged={refreshMyBags} />)
        )}
      </div>
    </>
  );
}
