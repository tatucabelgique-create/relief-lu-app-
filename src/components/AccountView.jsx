import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getMyReservations, requestRefund } from "../lib/reservations";
import { formatPickupWindow } from "./BagCard.jsx";
import AuthPrompt from "./AuthPrompt.jsx";
import ReviewForm from "./ReviewForm.jsx";
import { displayPriceCents } from "../lib/pricing.js";

// Même coupure que Too Good To Go : annulation en libre-service jusqu'à 2h
// avant le début du créneau de retrait, au-delà il faut contacter le
// commerçant directement (pas de centre d'aide à reconstruire ici).
const CANCELLATION_CUTOFF_MS = 2 * 60 * 60 * 1000;

function canCancel(r) {
  if (r.payment_status !== "paid" || r.status !== "confirmed") return false;
  if (!r.bags?.pickup_start) return false;
  return new Date(r.bags.pickup_start).getTime() - Date.now() >= CANCELLATION_CUTOFF_MS;
}

export default function AccountView({ user }) {
  const { lang, t } = useI18n();
  const [reservations, setReservations] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  async function refresh() {
    if (user) setReservations(await getMyReservations(user.id));
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function handleCancel(reservationId) {
    if (!window.confirm(t("account.cancelConfirm"))) return;
    setCancellingId(reservationId);
    setCancelError(null);
    try {
      await requestRefund(reservationId);
      await refresh();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <h1 className="page-title">{t("account.title")}</h1>
      {!user ? (
        <div className="panel">
          <AuthPrompt view="account" />
        </div>
      ) : reservations === null ? (
        <p className="page-sub">{t("public.loading")}</p>
      ) : !reservations.length ? (
        <p className="page-sub">{t("account.empty")}</p>
      ) : (
        <div className="panel">
          {cancelError && <p className="error-msg">{cancelError}</p>}
          {reservations.map((r) => {
            const existingReview = Array.isArray(r.reviews) ? r.reviews[0] : r.reviews;
            return (
              <div className="my-bag" key={r.id}>
                <div className="info">
                  <b>{r.bags?.title}</b>
                  <span>
                    {r.bags?.merchants?.business_name} · {formatPickupWindow(r.bags?.pickup_start, r.bags?.pickup_end, lang)}
                  </span>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <span className="pill-base chip-pill-outline">{t(`status.${r.status}`)}</span>
                    <span className={`pill-base chip-pill-outline payment-chip-${r.payment_status}`}>{t(`payment.status.${r.payment_status}`)}</span>
                  </div>
                  {r.payment_status === "paid" && r.status === "confirmed" && (
                    <span className="page-sub" style={{ fontWeight: 700, display: "block", marginTop: 6 }}>
                      {t("reserve.codeLabel")} : {r.pickup_code}
                    </span>
                  )}
                  {canCancel(r) && (
                    <button
                      className="btn secondary small"
                      style={{ marginTop: 8 }}
                      disabled={cancellingId === r.id}
                      onClick={() => handleCancel(r.id)}
                    >
                      {cancellingId === r.id ? t("account.cancelling") : t("account.cancelReservation")}
                    </button>
                  )}
                  {r.payment_status === "paid" &&
                    (existingReview ? (
                      <div className="stars" style={{ marginTop: 6 }}>
                        {"★".repeat(existingReview.rating)}
                        {"☆".repeat(5 - existingReview.rating)}
                      </div>
                    ) : (
                      <button className="btn secondary small" style={{ marginTop: 8 }} onClick={() => setReviewing(r)}>
                        {t("review.leaveOne")}
                      </button>
                    ))}
                </div>
                <div className="price">{(displayPriceCents(r.bags?.price_cents || 0, r.bags?.merchants?.waive_service_fee) / 100).toFixed(2)} €</div>
              </div>
            );
          })}
        </div>
      )}
      <ReviewForm reservation={reviewing} onClose={() => setReviewing(null)} onSubmitted={refresh} />
    </div>
  );
}
