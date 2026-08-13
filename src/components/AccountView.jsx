import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getMyReservations } from "../lib/reservations";
import { formatPickupWindow } from "./BagCard.jsx";
import AuthPrompt from "./AuthPrompt.jsx";
import ReviewForm from "./ReviewForm.jsx";

export default function AccountView({ user }) {
  const { lang, t } = useI18n();
  const [reservations, setReservations] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  async function refresh() {
    if (user) setReservations(await getMyReservations(user.id));
  }

  useEffect(() => {
    refresh();
  }, [user]);

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
                    <span className="chip-pill-outline">{t(`status.${r.status}`)}</span>
                    <span className={`chip-pill-outline payment-chip-${r.payment_status}`}>{t(`payment.status.${r.payment_status}`)}</span>
                  </div>
                  {r.payment_status === "paid" && r.status === "confirmed" && (
                    <span className="page-sub" style={{ fontWeight: 700, display: "block", marginTop: 6 }}>
                      {t("reserve.codeLabel")} : {r.pickup_code}
                    </span>
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
                <div className="price">{((r.bags?.price_cents || 0) / 100).toFixed(2)} €</div>
              </div>
            );
          })}
        </div>
      )}
      <ReviewForm reservation={reviewing} onClose={() => setReviewing(null)} onSubmitted={refresh} />
    </div>
  );
}
