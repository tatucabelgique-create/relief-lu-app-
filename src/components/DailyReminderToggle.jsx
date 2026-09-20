import { useEffect, useState } from "react";
import { isDailyReminderEnabled } from "../lib/dailyReminders";

const SECRET_KEY = "relief_marketing_secret"; // même secret que MarketingPush — un seul admin, pas besoin de le dupliquer.

// Interrupteur admin pour le rappel quotidien : tant que c'est désactivé,
// DailyReminders.jsx reste invisible pour tous les utilisateurs et le job
// planifié (send-daily-reminders) n'envoie rien. À activer une fois qu'il y a
// assez de commerçants actifs pour qu'un rappel mène à de vrais paniers.
export default function DailyReminderToggle() {
  const [secret, setSecret] = useState(() => localStorage.getItem(SECRET_KEY) || "");
  const [enabled, setEnabled] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    isDailyReminderEnabled()
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
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toggle-daily-reminders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: !enabled, admin_secret: secret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data.error || "Erreur." });
      } else {
        setEnabled(data.enabled);
        setResult({ type: "success", text: `Rappel quotidien ${data.enabled ? "activé" : "désactivé"}.` });
      }
    } catch {
      setResult({ type: "error", text: "Erreur réseau — réessaie." });
    }
    setBusy(false);
  }

  return (
    <div className="panel">
      <h2>Rappel quotidien</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>
        Notification générique ("N'oublie pas de sauver un panier aujourd'hui") aux utilisateurs qui ont choisi des jours de rappel.
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
