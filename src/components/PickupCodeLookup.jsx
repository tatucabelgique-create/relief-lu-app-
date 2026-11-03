import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { findReservationByCode, updateReservationStatus } from "../lib/reservations";

// Remplace le défilement visuel de la liste de réservations par une vraie
// vérification : le commerçant tape le code affiché par le client, l'app
// retrouve la réservation exacte (parmi SES sachets uniquement, voir
// findReservationByCode) plutôt que de compter sur un simple coup d'œil.
export default function PickupCodeLookup({ onChanged }) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(undefined); // undefined = pas encore cherché, null = introuvable
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSearching(true);
    setError(null);
    try {
      setResult(await findReservationByCode(code));
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function setStatus(status) {
    setUpdating(true);
    try {
      await updateReservationStatus(result.id, status);
      setResult({ ...result, status });
      onChanged?.();
    } finally {
      setUpdating(false);
    }
  }

  function reset() {
    setCode("");
    setResult(undefined);
    setError(null);
  }

  return (
    <div className="pickup-lookup">
      <h3>{t("merchant.pickupLookupTitle")}</h3>
      <form onSubmit={handleSearch} className="field" style={{ display: "flex", gap: 8, marginBottom: 0 }}>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (result !== undefined) setResult(undefined);
          }}
          placeholder={t("merchant.pickupLookupPlaceholder")}
          maxLength={6}
          style={{ textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, flex: 1 }}
        />
        <button className="btn small" type="submit" disabled={searching || !code.trim()}>
          {searching ? "…" : t("merchant.pickupLookupSearch")}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {result === null && <p className="page-sub" style={{ marginTop: 10 }}>{t("merchant.pickupLookupNotFound")}</p>}

      {result && (
        <div className="my-bag" style={{ marginTop: 10 }}>
          <div className="info">
            <b>{result.bags?.title}</b>
            <span>
              {result.email} · {result.quantity}x · {t(`status.${result.status}`)}
            </span>
            <span
              className={`pill-base chip-pill-outline payment-chip-${result.payment_status}`}
              style={{ display: "inline-block", width: "fit-content", marginTop: 6 }}
            >
              {t(`payment.status.${result.payment_status}`)}
            </span>
          </div>
          {result.status === "confirmed" && result.payment_status === "paid" ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button className="btn small" onClick={() => setStatus("picked_up")} disabled={updating}>
                {t("merchant.markPickedUp")}
              </button>
              <button className="btn secondary small" onClick={() => setStatus("no_show")} disabled={updating}>
                {t("merchant.markNoShow")}
              </button>
            </div>
          ) : (
            <span className="page-sub">{t("merchant.pickupAlreadyDone")}</span>
          )}
        </div>
      )}

      {result !== undefined && (
        <button type="button" className="btn secondary small" style={{ marginTop: 10 }} onClick={reset}>
          {t("merchant.pickupLookupReset")}
        </button>
      )}
    </div>
  );
}
