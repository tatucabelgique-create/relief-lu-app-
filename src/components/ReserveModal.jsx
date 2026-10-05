import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { reserveBag } from "../lib/reservations";
import { createCheckoutSession, arePaymentsLive } from "../lib/payments";
import { formatPickupWindow, isToday, isTomorrow } from "./BagCard.jsx";
import AuthPrompt from "./AuthPrompt.jsx";
import { notifyEngaged } from "./InstallPrompt.jsx";
import { displayPriceCents } from "../lib/pricing.js";

export default function ReserveModal({ bag, user, onClose, onReserved }) {
  const { lang, t } = useI18n();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  // Démarre bloqué (fail-closed) : mieux vaut un très bref flash du message
  // "bientôt disponible" le temps du fetch, que risquer d'autoriser un clic
  // avant d'avoir confirmé que les paiements sont réellement en mode live.
  const [paymentsLive, setPaymentsLive] = useState(false);

  // Ce composant reste monté en permanence (bag passe de null à un sachet à
  // l'ouverture, voir PublicView) — un simple useEffect au montage ne
  // suffirait pas, il faut suivre les changements de `bag`. Réserver
  // directement depuis la liste (sans passer par BagDetail) est au moins
  // aussi fréquent que l'ouverture du détail, donc le même signal
  // d'engagement doit s'y déclencher.
  useEffect(() => {
    if (bag) notifyEngaged();
  }, [bag]);

  // Vérifié une fois au montage (flag global, pas lié à un sachet précis) —
  // voir arePaymentsLive() dans payments.js : tant que le compte Stripe
  // n'est pas en mode live, on bloque ici plutôt que de laisser un client
  // atteindre un Checkout qui refusera sa vraie carte.
  useEffect(() => {
    arePaymentsLive().then(setPaymentsLive);
  }, []);

  if (!bag) return null;

  // Le prix affiché au client intègre déjà les frais de service (voir
  // pricing.js) — il n'y a pas de ligne séparée à montrer, juste ce total.
  const total = ((displayPriceCents(bag.price_cents) * qty) / 100).toFixed(2);
  const maxQty = Math.max(1, bag.quantity_left ?? 1);

  function changeQty(delta) {
    setQty((q) => Math.min(maxQty, Math.max(1, q + delta)));
  }

  // Le sachet est déjà réservé (stock décrémenté) à ce stade, en
  // payment_status='pending' — la redirection vers Stripe Checkout est
  // l'étape suivante ; le code de retrait n'est montré qu'après paiement
  // confirmé (voir PaymentResult.jsx, appelé par App.jsx via ?paid=1).
  async function handleConfirm() {
    if (!paymentsLive) return; // double sécurité, le bouton est déjà masqué dans ce cas
    setError("");
    setRedirecting(true);
    try {
      const row = await reserveBag(bag.id, qty);
      onReserved();
      const url = await createCheckoutSession(row.reservation_id);
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
      setRedirecting(false);
    }
  }

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="close" onClick={onClose}>
          ✕
        </button>
        {!user ? (
          <AuthPrompt title={t("reserve.loginRequired")} view={`reserve:${bag.id}`} />
        ) : (
          <div>
            <h2>{bag.title}</h2>
            {bag.merchants?.business_name && (
              <p className="desc" style={{ marginTop: -8 }}>
                {bag.merchants.business_name}
              </p>
            )}

            <div className="reserve-time-row">
              {isToday(bag.pickup_start) && <span className="pill-base chip-pill-outline">{t("bagDetail.today")}</span>}
              {isTomorrow(bag.pickup_start) && <span className="pill-base chip-pill-outline">{t("bagDetail.tomorrow")}</span>}
              <span className="reserve-time-badge figures">{formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}</span>
            </div>

            <div className="reserve-row">
              <span>{t("reserve.qty")}</span>
              <div className="qty-stepper">
                <button type="button" onClick={() => changeQty(-1)} disabled={redirecting || qty <= 1} aria-label="-">
                  −
                </button>
                <span className="figures">{qty}</span>
                <button type="button" onClick={() => changeQty(1)} disabled={redirecting || qty >= maxQty} aria-label="+">
                  +
                </button>
              </div>
            </div>

            <div className="reserve-row reserve-total">
              <span>{t("reserve.total")}</span>
              <b className="figures">{total} €</b>
            </div>

            {paymentsLive ? (
              <button className="btn" onClick={handleConfirm} disabled={redirecting}>
                {redirecting ? t("reserve.redirecting") : t("reserve.confirm")}
              </button>
            ) : (
              <p className="page-sub" style={{ textAlign: "center" }}>
                {t("reserve.paymentsComingSoon")}
              </p>
            )}
            {error && <p className="error-msg">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
