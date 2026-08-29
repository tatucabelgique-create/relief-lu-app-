import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useI18n } from "../lib/i18n.jsx";
import { formatPickupWindow, isToday, isTomorrow } from "./BagCard.jsx";
import { merchantMarkerIcon } from "../lib/leafletIcon";
import { notifyEngaged } from "./InstallPrompt.jsx";

// Icône "Share2" de Lucide (trois points reliés) — même icône que celle
// utilisée pour "Partager" dans tatuca, pour rester cohérent entre les apps.
function ShareIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// Page détail d'un sachet, façon TGTG (grande photo, infos du commerçant,
// description, carte + itinéraire) — remplace le clic direct sur "Réserver"
// qui n'ouvrait jusqu'ici que la petite modale, sans vue d'ensemble du sachet.
// "Emballages" et "Ingrédients & Allergènes" reprennent le texte générique
// fixe de la référence — le contenu d'un panier surprise varie chaque jour,
// donc TGTG ne demande pas au commerçant de le détailler à chaque sachet.
export default function BagDetail({ bag, rating, isFavorite, onToggleFavorite, onBack, onReserve, onOpenMerchant, distanceKm }) {
  const { lang, t } = useI18n();
  const merchant = bag.merchants;
  const hasDiscount = bag.original_price_cents && bag.original_price_cents > bag.price_cents;
  const soldOut = bag.status === "sold_out";
  const [scrolled, setScrolled] = useState(false);
  const [allergensOpen, setAllergensOpen] = useState(false);

  useEffect(() => {
    const el = document.querySelector(".bag-detail");
    function onScroll() {
      setScrolled(el.scrollTop > 180);
    }
    el?.addEventListener("scroll", onScroll);
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  // Signal d'engagement pour le bandeau d'installation PWA — ouvrir le détail
  // d'un sachet montre un vrai intérêt, pas besoin d'attendre un paiement.
  useEffect(() => {
    notifyEngaged();
  }, [bag.id]);

  const address = [merchant?.address, merchant?.city].filter(Boolean).join(", ");
  const hasCoords = merchant?.lat != null && merchant?.lng != null;
  const directionsUrl = hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${merchant.lat},${merchant.lng}` : null;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: bag.title, text: `${bag.title} — ${merchant?.business_name || ""}`, url: window.location.href }).catch(() => {});
    }
  }

  return (
    <div className="bag-detail">
      {/* En-tête compacte qui remplace la grande photo une fois qu'on a
          scrollé — même bascule que sur la référence, pour garder le nom du
          commerçant et les actions (retour/partage/favori) visibles. */}
      <div className={`bag-detail-compact-header ${scrolled ? "visible" : ""}`}>
        <button className="icon-circle" onClick={onBack} aria-label="back">
          ←
        </button>
        <b>{merchant?.business_name}</b>
        <div style={{ display: "flex", gap: 10 }}>
          {navigator.share && (
            <button className="icon-circle" onClick={handleShare} aria-label="share">
              <ShareIcon />
            </button>
          )}
          {onToggleFavorite && (
            <button className={`icon-circle ${isFavorite ? "active" : ""}`} onClick={() => onToggleFavorite(bag.merchant_id)} aria-label="favorite">
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>
      <div className="bag-detail-hero" style={bag.image_url ? { backgroundImage: `url('${bag.image_url}')` } : undefined}>
        {!bag.image_url && <span className="bag-detail-hero-fallback">🥡</span>}
        <div className="bag-detail-hero-top">
          <button className="icon-circle" onClick={onBack} aria-label="back">
            ←
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {navigator.share && (
              <button className="icon-circle" onClick={handleShare} aria-label="share">
                ↗
              </button>
            )}
            {onToggleFavorite && (
              <button className={`icon-circle ${isFavorite ? "active" : ""}`} onClick={() => onToggleFavorite(bag.merchant_id)} aria-label="favorite">
                {isFavorite ? "♥" : "♡"}
              </button>
            )}
          </div>
        </div>
        <div className="bag-detail-hero-bottom">
          <div className="bag-detail-hero-badges">
            <span className="badge-availability" style={{ position: "static" }}>
              {bag.quantity_left} {t("badge.available")}
            </span>
            <span className="chip-pill">{t(`merchant.category.${bag.category}`)}</span>
          </div>
          {merchant && (
            <div className="bag-detail-merchant">
              {merchant.logo_url && (
                <div className="merchant-logo" style={{ position: "static", width: 40, height: 40 }}>
                  <img src={merchant.logo_url} alt="" />
                </div>
              )}
              <b>{merchant.business_name}</b>
            </div>
          )}
        </div>
      </div>

      <div className="bag-detail-body">
        <h1>{bag.title}</h1>
        {rating && (
          <div className="bag-detail-rating">
            <span className="stars">★</span> {rating.avg.toFixed(1)} <span className="page-sub" style={{ margin: 0 }}>({rating.count})</span>
          </div>
        )}
        <div className="bag-detail-row">
          <span>
            🕒 {t("pickupWindow")} {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}
            {distanceKm != null && <> · {distanceKm.toFixed(1)} km</>}
          </span>
          {isToday(bag.pickup_start) && <span className="chip-pill-outline">{t("bagDetail.today")}</span>}
          {isTomorrow(bag.pickup_start) && <span className="chip-pill-outline">{t("bagDetail.tomorrow")}</span>}
          {bag.vegan && <span className="chip-pill-outline">🌿 {t("diet.vegan")}</span>}
          {!bag.vegan && bag.vegetarian && <span className="chip-pill-outline">🌱 {t("diet.vegetarian")}</span>}
        </div>

        {address && onOpenMerchant && (
          <>
            <div className="divider" />
            <button className="bag-detail-address" onClick={() => onOpenMerchant({ ...merchant, id: bag.merchant_id })}>
              <span>
                <span className="bag-detail-address-line">📍 {address}</span>
                <span className="bag-detail-address-sub">{t("bagDetail.seeMerchant")}</span>
              </span>
              <span className="chevron">›</span>
            </button>
          </>
        )}

        <div className="bag-detail-availability-banner">
          {soldOut ? t("badge.soldOut") : `${bag.quantity_left} ${t("badge.available")}`}
        </div>

        {/* Sachet épuisé : on remplace l'incitation aux notifications par une
            invitation à mettre le commerçant en favori (façon TGTG), plus la
            prochaine heure de disponibilité si le sachet est récurrent —
            réserver n'étant plus possible, l'incitation change d'objectif. */}
        {soldOut && onToggleFavorite && !isFavorite && (
          <button className="notify-toggle-row" onClick={() => onToggleFavorite(bag.merchant_id)}>
            <span>{t("bagDetail.favoritePrompt")}</span>
            <span>♡</span>
          </button>
        )}
        {soldOut && bag.is_recurring && (
          <div className="revisit-row">
            📅 {t("bagDetail.comeBackAt")}{" "}
            <b>{new Date(bag.pickup_start).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}</b> {t("bagDetail.tomorrowLower")}
          </div>
        )}

        {!soldOut && onToggleFavorite && (
          <button className="notify-toggle-row" onClick={() => onToggleFavorite(bag.merchant_id)}>
            <span>🔔 {t("bagDetail.notify")}</span>
            <span className={`toggle-switch ${isFavorite ? "on" : ""}`}>
              <span className="toggle-knob" />
            </span>
          </button>
        )}

        <div className="divider" />
        <h2>{t("bagDetail.about")}</h2>
        <p className="page-sub" style={{ marginBottom: 10 }}>🌱 {t("bagDetail.about.intro")}</p>
        <p className="page-sub" style={{ marginBottom: 10 }}>{t(`bagDetail.about.${bag.category || "autre"}`)}</p>
        <p className="page-sub" style={{ marginBottom: 10 }}>👉 {t("bagDetail.about.surprise")}</p>
        <p className="page-sub" style={{ marginBottom: 12 }}>💡 {t("bagDetail.about.fact")}</p>
        <span className="chip-pill-outline">{t(`merchant.category.${bag.category || "autre"}`)}</span>

        {rating?.criteria && Object.keys(rating.criteria).length > 0 && (
          <>
            <div className="divider" />
            <div className="row" style={{ alignItems: "flex-start" }}>
              <div>
                <h2>{t("bagDetail.overallExperience")}</h2>
                <p className="page-sub" style={{ marginTop: -4 }}>
                  {t("bagDetail.basedOnReviewsPrefix")} {rating.count} {t(rating.count === 1 ? "bagDetail.basedOnReviewsSuffixSingular" : "bagDetail.basedOnReviewsSuffix")}
                </p>
              </div>
              <div className="overall-rating-box">
                <span className="stars">★</span> {rating.avg.toFixed(1)}
              </div>
            </div>
            {["collecte", "qualite", "variete", "quantite"].map(
              (key) =>
                rating.criteria[key] != null && (
                  <div className="rating-bar-row" key={key}>
                    <span>
                      {t(`review.criteria.${key}`)} <b>{rating.criteria[key].toFixed(1)}</b>
                    </span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${(rating.criteria[key] / 5) * 100}%` }} />
                    </div>
                  </div>
                )
            )}
          </>
        )}

        {hasCoords && (
          <>
            <div className="divider" />
            <h2>{t("bagDetail.itinerary.title")}</h2>
            <div className="map-container" style={{ height: 200 }}>
              <MapContainer center={[merchant.lat, merchant.lng]} zoom={14} scrollWheelZoom={false} dragging={false} style={{ width: "100%", height: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[merchant.lat, merchant.lng]} icon={merchantMarkerIcon(merchant.logo_url)} />
              </MapContainer>
            </div>
            <a className="btn secondary" style={{ display: "block", textAlign: "center", marginTop: 12 }} href={directionsUrl} target="_blank" rel="noreferrer">
              {t("bagDetail.directions")}
            </a>
          </>
        )}

        <div className="divider" />
        <h2>{t("bagDetail.collect.title")}</h2>
        <p className="page-sub" style={{ marginBottom: 0 }}>{t("bagDetail.collect.text")}</p>

        <div className="divider" />
        <h2>{t("bagDetail.packaging.title")}</h2>
        <div className="packaging-cards">
          <div className="packaging-card">
            <span className="packaging-icon">📦</span>
            <b>{t("bagDetail.packaging.container")}</b>
            <span className="page-sub" style={{ margin: 0 }}>
              {bag.container_provided ? t("bagDetail.packaging.provided") : t("bagDetail.packaging.notProvided")}
            </span>
          </div>
          <div className="packaging-card">
            <span className="packaging-icon">🛍️</span>
            <b>{t("bagDetail.packaging.bag")}</b>
            <span className="page-sub" style={{ margin: 0 }}>
              {bag.bag_provided ? t("bagDetail.packaging.provided") : t("bagDetail.packaging.notProvided")}
            </span>
          </div>
        </div>
        {(!bag.container_provided || !bag.bag_provided) && (
          <div className="info-banner">ℹ️ {t("bagDetail.packaging.info")}</div>
        )}

        <div className="divider" />
        <button className="accordion-toggle" onClick={() => setAllergensOpen((v) => !v)}>
          <h2 style={{ margin: 0 }}>{t("bagDetail.allergens.title")}</h2>
          <span className={`chevron-down ${allergensOpen ? "open" : ""}`}>⌄</span>
        </button>
        {allergensOpen && <p className="page-sub" style={{ marginTop: 10 }}>{t("bagDetail.allergens.text")}</p>}
      </div>

      <div className="bag-detail-sticky">
        <span>
          {hasDiscount && <span className="price-original">{(bag.original_price_cents / 100).toFixed(2)} €</span>}
          <span className="price">{(bag.price_cents / 100).toFixed(2)} €</span>
        </span>
        <button className="btn" disabled={soldOut} onClick={() => !soldOut && onReserve(bag)}>
          {soldOut ? t("badge.soldOut") : t("reserve")}
        </button>
      </div>
    </div>
  );
}
