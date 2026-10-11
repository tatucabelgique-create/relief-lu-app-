import { useEffect, useState } from "react";
import { isLowDemandAlertsEnabled } from "../lib/lowDemandAlerts";

const SECRET_KEY = "relief_marketing_secret"; // même secret que MarketingPush/DailyReminderToggle — un seul admin.

// Interrupteur admin pour l'alerte "faible demande" (V1 à règles, voir
// db/schema-v25-low-demand-alerts.sql) : tant que c'est désactivé, le job
// planifié (check-low-demand-bags) ne fait rien. À activer une fois le
// comportement validé en conditions réelles.
export default function LowDemandAlertsToggle() {
  const [secret, setSecret] = useState(() => localStorage.getItem(SECRET_KEY) || "");
  const [enabled, setEnabled] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    isLowDemandAlertsEnabled()
      .then(setEnabled)
      .catch(() => setEnabled(false));
  }, []);

  async function flip() {
    if (!secret) {
      setResult({ type: "error", text: "Renseigne la clé secrète ci-dessous." });
      return;
    }
    localStorage.setItem(SECRET_KEY, secret);
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rapid-api`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ key: "low_demand_alerts", enabled: !enabled, admin_secret: secret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data.error || "Erreur." });
      } else {
        setEnabled(data.enabled);
        setResult({ type: "success", text: `Alerte faible demande ${data.enabled ? "activée" : "désactivée"}.` });
      }
    } catch {
      setResult({ type: "error", text: "Erreur réseau — réessaie." });
    }
    setBusy(false);
  }

  return (
    <div className="panel">
      <h2>Alerte faible demande</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>
        Prévient automatiquement un commerçant par push quand un panier n'a reçu aucune réservation et que la fin du créneau de retrait approche (moins de 2h) — suggère de baisser le prix avant qu'il ne soit trop tard.
        Statut actuel : <strong>{enabled === null ? "…" : enabled ? "Activé" : "Désactivé"}</strong>.
      </p>

      <div className="field">
        <label>Clé secrète</label>
        <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="MARKETING_PUSH_SECRET" />
      </div>

      <button className="btn" onClick={flip} disabled={busy || enabled === null}>
        {busy ? "…" : enabled ? "Désactiver" : "Activer"}
      </button>

      {result && <p className={result.type === "error" ? "error-msg" : "success-msg"}>{result.text}</p>}
    </div>
  );
}
