import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";

// Même estimation que la bannière d'impact globale (lib/impact.js) — reprise
// ici pour l'afficher sachet par sachet, comme le fait LastBite.
const CO2_KG_PER_BAG = 2.5;

export function formatPickupWindow(startISO, endISO, lang) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const opts = { hour: "2-digit", minute: "2-digit" };
  return s.toLocaleTimeString(lang, opts) + " – " + e.toLocaleTimeString(lang, opts);
}

export function isToday(iso) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function isTomorrow(iso) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return new Date(iso).toDateString() === tomorrow.toDateString();
}

function formatDuration(ms) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m}min`;
}

function useCountdown(startISO, endISO, t) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (now >= end) return t("countdown.closed");
  if (now < start) return `${t("countdown.notOpenYet")} ${new Date(startISO).toLocaleTimeString()}`;
  return `${t("countdown.closesIn")} ${formatDuration(end - now)}`;
}

export default function BagCard({ bag, onReserve, onToggleFavorite, isFavorite, distanceKm, rating, onOpenDetail }) {
  const { lang, t } = useI18n();
  const countdown = useCountdown(bag.pickup_start, bag.pickup_end, t);
  const hasDiscount = bag.original_price_cents && bag.original_price_cents > bag.price_cents;
  const soldOut = bag.status === "sold_out";
  // Basé sur le taux de vente (proportion déjà réservée), pas juste "il en
  // reste 1" — sinon un sachet publié à l'unité déclenchait le badge sans
  // jamais avoir été réservé, ce qui n'a rien de "part vite".
  const sellingFast = !soldOut && bag.quantity_total > 1 && (bag.quantity_total - bag.quantity_left) / bag.quantity_total >= 0.66;

  return (
    <div
      className={`card ${soldOut ? "card-sold-out" : ""}`}
      onClick={() => onOpenDetail?.(bag)}
      style={onOpenDetail ? { cursor: "pointer" } : undefined}
    >
      <div className="thumb" style={bag.image_url ? { backgroundImage: `url('${bag.image_url}')` } : undefined}>
        {!bag.image_url && "🥡"}
        <div className={`badge-availability ${soldOut ? "badge-sold-out" : ""} ${sellingFast ? "badge-selling-fast" : ""}`}>
          {soldOut ? t("badge.soldOut") : sellingFast ? t("badge.sellingFast") : `${bag.quantity_left} ${t("badge.available")}`}
        </div>
        {rating && (
          <div className="badge-rating">
            ★ {rating.avg.toFixed(1)}
          </div>
        )}
        {bag.merchants?.logo_url && (
          <div className="merchant-logo">
            <img src={bag.merchants.logo_url} alt="" />
          </div>
        )}
      </div>
      <div className="body">
        <div className="merchant row">
          <span>{bag.merchants?.business_name || ""}</span>
          {onToggleFavorite && (
            <button
              className={`favorite-btn-inline ${isFavorite ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(bag.merchant_id);
              }}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
        <h3>{bag.title}</h3>
        <div className="meta">
          {isToday(bag.pickup_start) ? t("pickupWindow.today") : isTomorrow(bag.pickup_start) ? t("pickupWindow.tomorrow") : t("pickupWindow")}{" "}
          {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}
          {distanceKm != null && <> · {distanceKm.toFixed(1)} km</>}
          {bag.vegan && <> · 🌿 {t("diet.vegan")}</>}
          {!bag.vegan && bag.vegetarian && <> · 🌱 {t("diet.vegetarian")}</>}
        </div>
        <div className="countdown">{countdown}</div>
        <div className="row" style={{ marginTop: 10 }}>
          <span>
            {hasDiscount && <span className="price-original">{(bag.original_price_cents / 100).toFixed(2)} €</span>}
            <span className="price">{(bag.price_cents / 100).toFixed(2)} €</span>
          </span>
          <button
            className="btn small"
            disabled={soldOut}
            onClick={(e) => {
              e.stopPropagation();
              if (!soldOut) onReserve(bag);
            }}
          >
            {soldOut ? t("badge.soldOut") : t("reserve")}
          </button>
        </div>
        <div className="co2-pill">🌍 ~{CO2_KG_PER_BAG} {t("badge.co2Suffix")}</div>
      </div>
    </div>
  );
}
