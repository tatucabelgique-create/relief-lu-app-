import { useEffect, useState } from "react";
import { listPendingMerchants, verifyMerchant } from "../lib/merchants";

export default function MerchantVerification() {
  const [pending, setPending] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setPending(await listPendingMerchants());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function approve(id) {
    setBusyId(id);
    setError("");
    try {
      await verifyMerchant(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (pending === null) return <p className="page-sub">Chargement…</p>;

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
          <button className="btn small" disabled={busyId === m.id} onClick={() => approve(m.id)}>
            {busyId === m.id ? "…" : "Approuver"}
          </button>
        </div>
      ))}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}
