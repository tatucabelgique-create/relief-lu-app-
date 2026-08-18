import { useEffect, useState } from "react";
import { listMerchants, setMerchantVerified } from "../lib/merchants";

export default function MerchantVerification() {
  const [merchants, setMerchants] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setMerchants(await listMerchants());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggle(id, verified) {
    setBusyId(id);
    setError("");
    try {
      await setMerchantVerified(id, verified);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (merchants === null) return <p className="page-sub">Chargement…</p>;

  const pending = merchants.filter((m) => !m.verified);
  const verified = merchants.filter((m) => m.verified);

  return (
    <div className="panel">
      <h2>Commerçants à vérifier {pending.length > 0 && `(${pending.length})`}</h2>
      {pending.length === 0 && <p className="page-sub">Aucune demande en attente.</p>}
      {pending.map((m) => (
        <div key={m.id} style={{ borderTop: "1px solid rgba(239,230,211,0.12)", padding: "14px 0" }}>
          <strong>{m.business_name}</strong>
          <p className="page-sub" style={{ margin: "4px 0" }}>
            {[m.address, m.city].filter(Boolean).join(", ")}
          </p>
          <p className="page-sub" style={{ margin: "4px 0" }}>
            {m.phone || "Pas de téléphone"} — {m.registration_number || "Pas de n° RCS"}
          </p>
          <button className="btn small" disabled={busyId === m.id} onClick={() => toggle(m.id, true)}>
            {busyId === m.id ? "…" : "Approuver"}
          </button>
        </div>
      ))}

      <h2 style={{ marginTop: 28 }}>Commerçants vérifiés {verified.length > 0 && `(${verified.length})`}</h2>
      {verified.length === 0 && <p className="page-sub">Aucun commerçant vérifié pour l'instant.</p>}
      {verified.map((m) => (
        <div key={m.id} style={{ borderTop: "1px solid rgba(239,230,211,0.12)", padding: "14px 0" }}>
          <strong>{m.business_name}</strong>
          <p className="page-sub" style={{ margin: "4px 0" }}>
            {[m.address, m.city].filter(Boolean).join(", ")}
          </p>
          <button className="btn secondary small" disabled={busyId === m.id} onClick={() => toggle(m.id, false)}>
            {busyId === m.id ? "…" : "Suspendre"}
          </button>
        </div>
      ))}

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}
