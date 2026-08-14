import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useI18n } from "../lib/i18n.jsx";
import { formatPickupWindow } from "./BagCard.jsx";
import { merchantMarkerIcon } from "../lib/leafletIcon";

// Page profil commerçant façon TGTG, atteinte en tapant l'adresse depuis la
// fiche sachet — regroupe adresse/carte (retirées de BagDetail pour éviter
// le doublon) et la liste des autres paniers actifs de ce commerçant.
export default function MerchantProfile({ merchant, bags, rating, distanceKm, onBack, onOpenBag }) {
  const { lang, t } = useI18n();
  if (!merchant) return null;

  const address = [merchant.address, merchant.city].filter(Boolean).join(", ");
  const hasCoords = merchant.lat != null && merchant.lng != null;
  const directionsUrl = hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${merchant.lat},${merchant.lng}` : null;

  return (
    <div className="bag-detail">
      <div className="bag-detail-compact-header visible">
        <button className="icon-circle" onClick={onBack} aria-label="back">
          ←
        </button>
        <b>{merchant.business_name}</b>
        <span style={{ width: 38 }} />
      </div>

      <div className="bag-detail-body" style={{ paddingTop: 74 }}>
        <div className="merchant-profile-head">
          {merchant.logo_url && (
            <div className="merchant-logo" style={{ position: "static", width: 56, height: 56 }}>
              <img src={merchant.logo_url} alt="" />
            </div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>{merchant.business_name}</h1>
            {distanceKm != null && (
              <p className="page-sub" style={{ margin: 0 }}>
                {distanceKm.toFixed(1)} km
              </p>
            )}
          </div>
        </div>

        {rating && (
          <div className="bag-detail-rating">
            <span className="stars">★</span> {rating.avg.toFixed(1)}{" "}
            <span className="page-sub" style={{ margin: 0 }}>
              ({rating.count} {t("merchantProfile.reviews")})
            </span>
          </div>
        )}

        {address && (
          <>
            <div className="divider" />
            <a className="bag-detail-address" href={directionsUrl || "#"} target={directionsUrl ? "_blank" : undefined} rel="noreferrer">
              <span>📍 {address}</span>
              <span className="chevron">›</span>
            </a>
          </>
        )}

        <div className="divider" />
        <h2>{t("merchantProfile.activeBags")}</h2>
        {!bags.length ? (
          <p className="page-sub">{t("merchantProfile.noBags")}</p>
        ) : (
          <div className="merchant-bag-list">
            {bags.map((bag) => (
              <button key={bag.id} className="merchant-bag-row" onClick={() => onOpenBag(bag)}>
                <div>
                  <b>{bag.title}</b>
                  <span className="page-sub">{formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="price">{(bag.price_cents / 100).toFixed(2)} €</span>
                  <span className="chevron">›</span>
                </div>
              </button>
            ))}
          </div>
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
      </div>
    </div>
  );
}
