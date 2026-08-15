import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { cancelBag } from "../lib/bags";
import { getReservationsForBag, updateReservationStatus } from "../lib/reservations";

export default function MerchantBagRow({ bag, onChanged }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reservations, setReservations] = useState(null);

  async function toggleOpen() {
    if (!open && reservations === null) setReservations(await getReservationsForBag(bag.id));
    setOpen(!open);
  }

  async function setStatus(reservationId, status) {
    await updateReservationStatus(reservationId, status);
    setReservations(await getReservationsForBag(bag.id));
    onChanged();
  }

  async function handleCancelBag() {
    await cancelBag(bag.id);
    onChanged();
  }

  return (
    <div className="my-bag" style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div className="row">
        <div className="info">
          <b>{bag.title}</b>
          <span>
            {bag.quantity_left}/{bag.quantity_total} {t("left")} · {(bag.price_cents / 100).toFixed(2)} € · {t(`bagStatus.${bag.status}`)}
            {bag.is_recurring && <> · 🔁 {t("merchant.f.recurring")}</>}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn secondary small" onClick={toggleOpen}>
            {open ? t("merchant.hideReservations") : t("merchant.showReservations")}
          </button>
          {bag.status !== "cancelled" && (
            <button className="btn secondary small" onClick={handleCancelBag}>
              {t("merchant.cancelBag")}
            </button>
          )}
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 10 }}>
          {!reservations?.length ? (
            <span className="page-sub">{t("merchant.noReservations")}</span>
          ) : (
            reservations.map((r) => (
              <div className="my-bag" key={r.id}>
                <div className="info">
                  <b>{r.email}</b>
                  <span>
                    {r.pickup_code} · {r.quantity}x · {t(`status.${r.status}`)}
                  </span>
                  <span
                    className={`chip-pill-outline payment-chip-${r.payment_status}`}
                    style={{ display: "inline-block", width: "fit-content", marginTop: 6 }}
                  >
                    {t(`payment.status.${r.payment_status}`)}
                  </span>
                </div>
                {r.status === "confirmed" && r.payment_status === "paid" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn small" onClick={() => setStatus(r.id, "picked_up")}>
                      {t("merchant.markPickedUp")}
                    </button>
                    <button className="btn secondary small" onClick={() => setStatus(r.id, "no_show")}>
                      {t("merchant.markNoShow")}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
