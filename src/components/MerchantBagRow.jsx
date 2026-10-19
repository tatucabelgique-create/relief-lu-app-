import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { cancelBag, stopRecurring, updateBagPrice } from "../lib/bags";
import { getReservationsForBag, updateReservationStatus, requestRefund } from "../lib/reservations";

const MIN_PRICE = 3.99;

export default function MerchantBagRow({ bag, onChanged }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [reservations, setReservations] = useState(null);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState((bag.price_cents / 100).toFixed(2));
  const [priceError, setPriceError] = useState(null);
  const [savingPrice, setSavingPrice] = useState(false);
  const [cancellingBag, setCancellingBag] = useState(false);
  const [refundingId, setRefundingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Réservé aux sachets encore à quantité pleine — voir le commentaire dans
  // updateBagPrice() : on évite tout risque de changer ce que paie un client
  // qui a déjà réservé une unité de ce sachet.
  const canEditPrice = bag.status === "active" && bag.quantity_left === bag.quantity_total;

  async function handleSavePrice() {
    const value = parseFloat(priceInput.replace(",", "."));
    if (isNaN(value) || value < MIN_PRICE) {
      setPriceError(`${t("merchant.priceMin")} ${MIN_PRICE.toFixed(2)} €`);
      return;
    }
    setPriceError(null);
    setSavingPrice(true);
    try {
      await updateBagPrice(bag.id, Math.round(value * 100));
      setEditingPrice(false);
      onChanged();
    } finally {
      setSavingPrice(false);
    }
  }

  async function toggleOpen() {
    if (!open && reservations === null) setReservations(await getReservationsForBag(bag.id));
    setOpen(!open);
  }

  async function setStatus(reservationId, status) {
    await updateReservationStatus(reservationId, status);
    setReservations(await getReservationsForBag(bag.id));
    onChanged();
  }

  // Annuler un sachet ne doit jamais laisser ses clients déjà payés de côté
  // — façon TGTG ("si le commerçant annule, pas besoin de demander un
  // remboursement") : on rembourse automatiquement chaque réservation payée
  // avant d'annuler le sachet lui-même, après confirmation du commerçant
  // s'il y en a au moins une (il doit savoir que ça va se produire).
  async function handleCancelBag() {
    setActionError(null);
    const current = reservations ?? (await getReservationsForBag(bag.id));
    const paid = current.filter((r) => r.payment_status === "paid" && r.status === "confirmed");

    if (paid.length && !window.confirm(`${paid.length} ${t("merchant.cancelBagConfirmPaid")}`)) return;
    if (!paid.length && !window.confirm(t("merchant.cancelBagConfirm"))) return;

    setCancellingBag(true);
    try {
      for (const r of paid) {
        await requestRefund(r.id);
      }
      await cancelBag(bag.id);
      onChanged();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCancellingBag(false);
    }
  }

  async function handleRefund(reservationId) {
    if (!window.confirm(t("merchant.refundConfirm"))) return;
    setActionError(null);
    setRefundingId(reservationId);
    try {
      await requestRefund(reservationId);
      setReservations(await getReservationsForBag(bag.id));
      onChanged();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setRefundingId(null);
    }
  }

  async function handleStopRecurring() {
    await stopRecurring(bag.id);
    onChanged();
  }

  return (
    <div className="my-bag" style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div className="row">
        <div className="info">
          <b>{bag.title}</b>
          <span>
            {bag.quantity_left}/{bag.quantity_total} {t("left")} ·{" "}
            {editingPrice ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number"
                  min={MIN_PRICE}
                  step="0.5"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  style={{ width: 70, padding: "2px 6px" }}
                  autoFocus
                />
                €
                <button className="btn small" onClick={handleSavePrice} disabled={savingPrice}>
                  {savingPrice ? "…" : t("save")}
                </button>
                <button className="btn secondary small" onClick={() => setEditingPrice(false)} disabled={savingPrice}>
                  {t("cancel")}
                </button>
              </span>
            ) : (
              <>
                {(bag.price_cents / 100).toFixed(2)} €
                {canEditPrice && (
                  <button
                    className="btn secondary small"
                    style={{ marginLeft: 6, padding: "1px 8px" }}
                    onClick={() => setEditingPrice(true)}
                  >
                    {t("merchant.editPrice")}
                  </button>
                )}
              </>
            )}{" "}
            · {t(`bagStatus.${bag.status}`)}
            {bag.is_recurring && <> · 🔁 {t("merchant.f.recurring")}</>}
          </span>
          {priceError && <span className="error-msg">{priceError}</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn secondary small" onClick={toggleOpen}>
            {open ? t("merchant.hideReservations") : t("merchant.showReservations")}
          </button>
          {bag.status !== "cancelled" && bag.is_recurring && (
            <button className="btn secondary small" onClick={handleStopRecurring}>
              {t("merchant.stopRecurring")}
            </button>
          )}
          {bag.status !== "cancelled" && (
            <button className="btn secondary small" onClick={handleCancelBag} disabled={cancellingBag}>
              {cancellingBag ? t("merchant.cancelling") : t("merchant.cancelBag")}
            </button>
          )}
        </div>
      </div>
      {actionError && <span className="error-msg">{actionError}</span>}
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
                    className={`pill-base chip-pill-outline payment-chip-${r.payment_status}`}
                    style={{ display: "inline-block", width: "fit-content", marginTop: 6 }}
                  >
                    {t(`payment.status.${r.payment_status}`)}
                  </span>
                </div>
                {r.status === "confirmed" && r.payment_status === "paid" && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn small" onClick={() => setStatus(r.id, "picked_up")}>
                      {t("merchant.markPickedUp")}
                    </button>
                    <button className="btn secondary small" onClick={() => setStatus(r.id, "no_show")}>
                      {t("merchant.markNoShow")}
                    </button>
                    <button className="btn secondary small" onClick={() => handleRefund(r.id)} disabled={refundingId === r.id}>
                      {refundingId === r.id ? t("merchant.refunding") : t("merchant.refund")}
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
