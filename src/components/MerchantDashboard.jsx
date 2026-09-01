import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadMerchantBags, publishBag, uploadBagPhoto } from "../lib/bags";
import { getRecentSoldCount } from "../lib/merchantStats";
import { notifyNewBag } from "../lib/notify";
import { getErrorMessage } from "../lib/auth";
import MerchantLogoUpload from "./MerchantLogoUpload.jsx";
import MerchantStats from "./MerchantStats.jsx";
import MerchantBagRow from "./MerchantBagRow.jsx";
import MerchantRegistrationForm from "./MerchantRegistrationForm.jsx";
import NotificationToggle from "./NotificationToggle.jsx";
import StripeConnectPanel from "./StripeConnectPanel.jsx";

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
  vegetarian: false,
  vegan: false,
};

export default function MerchantDashboard({ user, merchant, onMerchantChanged }) {
  const { t } = useI18n();
  const [form, setForm] = useState(emptyForm);
  const [priceTouched, setPriceTouched] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState(null);
  const [myBags, setMyBags] = useState([]);
  const [statsKey, setStatsKey] = useState(0);
  const [editingInfo, setEditingInfo] = useState(false);
  // Prix conseillé façon TGTG : -70% tant que le commerçant vend peu, -50%
  // au-delà d'un certain volume (voir getRecentSoldCount) — sert uniquement
  // de suggestion par défaut, jamais imposé (voir setOriginalPrice). Seuil
  // configurable par le commerçant lui-même (merchant.dynamic_pricing_threshold,
  // schema-v19) plutôt que fixe : un seuil unique mal calibré pour tous
  // déclenchait le mécanisme trop tôt pour un commerçant qui débute, avant
  // même d'avoir construit une base de clients fidèles à -70%. NULL = désactivé,
  // toujours -70% suggéré.
  const [recentSoldCount, setRecentSoldCount] = useState(0);

  async function refreshMyBags() {
    setMyBags(await loadMerchantBags(user.id));
    setStatsKey((k) => k + 1);
  }

  useEffect(() => {
    refreshMyBags();
    if (merchant?.dynamic_pricing_threshold != null) {
      getRecentSoldCount(user.id)
        .then(setRecentSoldCount)
        .catch(() => {}); // best-effort : le prix conseillé retombe sur -70% par défaut si l'appel échoue
    }
  }, [user.id, merchant?.dynamic_pricing_threshold]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Le prix réduit se calcule automatiquement (÷3 en dessous du seuil choisi
  // par le commerçant, ÷2 au-delà, mécanique exacte de TGTG — voir
  // suggestPrice) tant que le commerçant n'a pas modifié ce champ lui-même —
  // sitôt qu'il y touche, on respecte son choix et on arrête de l'écraser.
  function setOriginalPrice(value) {
    const threshold = merchant?.dynamic_pricing_threshold;
    const divisor = threshold != null && recentSoldCount >= threshold ? 2 : 3;
    setForm((f) => ({
      ...f,
      originalPrice: value,
      price: priceTouched ? f.price : value ? suggestPrice(parseFloat(value), divisor) : f.price,
    }));
  }

  // Reproduit le calcul observé sur 4 vrais sachets TGTG (captures fournies) :
  // le prix normal divisé par 3 (palier de base, ≈ -66,7%) ou par 2 (palier
  // haut volume, -50%) donne une valeur brute, mais TGTG n'affiche JAMAIS ce
  // brut tel quel — les 4 exemples réels se terminent tous par ,49 / ,95 ou
  // ,99 (jamais un centime arbitraire du type ,67). On arrondit donc au prix
  // "charme" le plus proche parmi ces trois terminaisons plutôt qu'au centime
  // près. Ex. 14,85€÷3 = 4,95€ pile (déjà dans le catalogue) ; 9€÷3 = 3,00€
  // brut → 2,99€ est la terminaison la plus proche ; 15€÷2 = 7,50€ brut →
  // 7,49€ la plus proche.
  function suggestPrice(original, divisor) {
    const rawCents = (original * 100) / divisor;
    const wholeEuros = Math.floor(rawCents / 100);
    const candidates = [];
    for (let e = wholeEuros - 1; e <= wholeEuros + 1; e++) {
      for (const ending of [49, 95, 99]) candidates.push(e * 100 + ending);
    }
    let cents = candidates.reduce((best, c) => (Math.abs(c - rawCents) < Math.abs(best - rawCents) ? c : best));
    // Plancher à 399 (3,99€) : en dessous, les frais de paiement fixes
    // rendent la vente non rentable (même seuil que la validation dans
    // handlePublish) — un prix normal trop bas ne doit jamais suggérer un prix invalide.
    cents = Math.max(399, cents);
    return (cents / 100).toFixed(2);
  }

  function setPrice(value) {
    setPriceTouched(true);
    set("price", value);
  }

  // Végan implique végétarien — coché automatiquement pour éviter d'avoir à
  // cocher les deux cases séparément (l'inverse n'est pas vrai, décocher
  // végan ne touche pas à végétarien).
  function setVegan(checked) {
    setForm((f) => ({ ...f, vegan: checked, vegetarian: checked ? true : f.vegetarian }));
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
    // En dessous de ce seuil, les frais fixes de traitement Stripe (~0,25-0,35€,
    // incompressibles quel que soit le prestataire) mangent une part
    // disproportionnée de la commission — pas un problème de taux, un problème
    // structurel des petites transactions. 3,99€ reste cohérent avec le prix
    // d'entrée habituel chez TGTG.
    if (parseFloat(form.price || "0") < 3.99) {
      setMsg({ type: "error", text: "Le prix réduit doit être d'au moins 3,99€ (les frais de paiement fixes rendent les sachets moins chers non rentables)." });
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
        // datetime-local ne porte aucune info de fuseau — new Date(...) l'interprète
        // dans le fuseau du navigateur (donc celui du commerçant), puis toISOString()
        // produit un horaire UTC correct. Envoyer form.start/form.end tels quels
        // faisait perdre le fuseau et stockait l'heure locale comme si elle était UTC.
        pickup_start: new Date(form.start).toISOString(),
        pickup_end: new Date(form.end).toISOString(),
        is_recurring: form.recurring,
        container_provided: form.containerProvided,
        bag_provided: form.bagProvided,
        vegetarian: form.vegetarian,
        vegan: form.vegan,
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

      {merchant && !editingInfo && (
        <div className="panel">
          <h2>{merchant.business_name}</h2>
          <p className="page-sub" style={{ marginBottom: 12 }}>
            {[merchant.address, merchant.city].filter(Boolean).join(", ") || t("merchant.noAddressSet")}
          </p>
          <button className="btn secondary small" onClick={() => setEditingInfo(true)}>
            {t("merchant.editInfo")}
          </button>
        </div>
      )}
      {merchant && editingInfo && (
        <MerchantRegistrationForm
          user={user}
          merchant={merchant}
          onDone={() => {
            setEditingInfo(false);
            onMerchantChanged();
          }}
        />
      )}

      {merchant?.verified && (
        <div className="panel">
          <h2>{t("merchant.notifTitle")}</h2>
          <p className="page-sub" style={{ marginBottom: 12 }}>
            {t("merchant.notifDesc")}
          </p>
          <NotificationToggle user={user} />
        </div>
      )}

      {merchant?.verified && <StripeConnectPanel merchant={merchant} />}

      {merchant && !merchant.verified && (
        <div className="panel">
          <h2>{t("merchant.verification.pendingTitle")}</h2>
          <p className="page-sub">{t("merchant.verification.pendingDesc")}</p>
        </div>
      )}

      {merchant?.verified && (
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
            <input type="number" min="3.99" step="0.5" value={form.price} onChange={(e) => setPrice(e.target.value)} />
            {merchant?.dynamic_pricing_threshold != null && recentSoldCount >= merchant.dynamic_pricing_threshold && (
              <span className="field-hint">
                {t("merchant.f.priceHint50Prefix")} {merchant.dynamic_pricing_threshold} {t("merchant.f.priceHint50Suffix")}
              </span>
            )}
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

        <label className="checkbox-field">
          <input type="checkbox" checked={form.vegetarian} onChange={(e) => set("vegetarian", e.target.checked)} />
          <span>{t("merchant.f.vegetarian")}</span>
        </label>

        <label className="checkbox-field">
          <input type="checkbox" checked={form.vegan} onChange={(e) => setVegan(e.target.checked)} />
          <span>{t("merchant.f.vegan")}</span>
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
      )}

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
