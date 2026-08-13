import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { reserveBag } from "../lib/reservations";
import { createCheckoutSession } from "../lib/payments";
import { formatPickupWindow } from "./BagCard.jsx";
import AuthPrompt from "./AuthPrompt.jsx";

export default function ReserveModal({ bag, user, onClose, onReserved }) {
  const { lang, t } = useI18n();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  if (!bag) return null;

  // Le sachet est déjà réservé (stock décrémenté) à ce stade, en
  // payment_status='pending' — la redirection vers Stripe Checkout est
  // l'étape suivante ; le code de retrait n'est montré qu'après paiement
  // confirmé (voir PaymentResult.jsx, appelé par App.jsx via ?paid=1).
  async function handleConfirm() {
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
          <AuthPrompt title={t("reserve.loginRequired")} description={t("reserve.loginDesc")} view={`reserve:${bag.id}`} />
        ) : (
          <div>
            <h2>{bag.title}</h2>
            <p className="desc">
              {(bag.price_cents / 100).toFixed(2)} € · {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}
            </p>
            <div className="field">
              <label>{t("reserve.qty")}</label>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)} disabled={redirecting} />
            </div>
            <button className="btn" onClick={handleConfirm} disabled={redirecting}>
              {redirecting ? t("reserve.redirecting") : t("reserve.confirm")}
            </button>
            {error && <p className="error-msg">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
