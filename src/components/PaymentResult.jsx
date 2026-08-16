import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getReservation, releaseReservation } from "../lib/reservations";

// Affiché au retour de Stripe Checkout (voir App.jsx, déclenché par
// ?paid=1|0&reservation=<id> dans l'URL de succès/annulation configurée dans
// create-checkout-session). Le code de retrait n'est montré qu'ici, une fois
// le paiement confirmé — jamais avant, contrairement à l'ancien flux gratuit.
export default function PaymentResult({ reservationId, success, onClose }) {
  const { t } = useI18n();
  const [reservation, setReservation] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!success) {
      releaseReservation(reservationId).catch(() => {});
      return;
    }
    getReservation(reservationId)
      .then(setReservation)
      .catch(() => setError(t("payment.error")));
  }, [reservationId, success]);

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="close" onClick={onClose}>
          ✕
        </button>
        {!success ? (
          <div>
            <h2>{t("payment.cancelledTitle")}</h2>
            <p className="desc">{t("payment.cancelledDesc")}</p>
          </div>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : reservation === undefined ? (
          <p className="page-sub">…</p>
        ) : reservation.payment_status === "paid" ? (
          <div>
            <h2>{t("reserve.doneTitle")}</h2>
            <p className="desc">{t("reserve.doneDesc")}</p>
            <div className="code-box">
              <div className="code">{reservation.pickup_code}</div>
              <div className="code-label">{t("reserve.codeLabel")}</div>
            </div>
          </div>
        ) : (
          <div>
            <h2>{t("payment.pendingTitle")}</h2>
            <p className="desc">{t("payment.pendingDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
