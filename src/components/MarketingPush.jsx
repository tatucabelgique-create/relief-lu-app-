import { useState } from "react";

const SECRET_KEY = "relief_marketing_secret";

// Page cachée (accessible via app.html?view=marketing, pas dans la barre du
// bas) pour envoyer une notification push marketing à tous les utilisateurs
// abonnés — voir supabase/functions/send-marketing-push. Remplace le besoin
// de taper une commande curl à chaque envoi.
export default function MarketingPush() {
  const [secret, setSecret] = useState(() => localStorage.getItem(SECRET_KEY) || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  async function send() {
    setResult(null);
    if (!secret || !title || !body) {
      setResult({ type: "error", text: "Remplis le secret, le titre et le message." });
      return;
    }
    localStorage.setItem(SECRET_KEY, secret);
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clever-processor`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ title, body, url: "./app.html" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ type: "error", text: data.error || data.message || "Erreur d'envoi." });
      } else {
        setResult({ type: "success", text: `Envoyée à ${data.sent} personne(s) sur ${data.total} abonnées.` });
        setTitle("");
        setBody("");
      }
    } catch {
      setResult({ type: "error", text: "Erreur réseau — réessaie." });
    }
    setSending(false);
  }

  return (
    <div className="panel">
      <h2>Notification marketing</h2>
      <p className="page-sub" style={{ marginBottom: 20 }}>
        Envoyée à tous les utilisateurs abonnés aux notifications, pas seulement à ceux qui suivent un commerçant précis.
      </p>

      <div className="field">
        <label>Clé secrète</label>
        <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="MARKETING_PUSH_SECRET" />
        <span className="field-hint">Enregistrée sur cet appareil, à saisir une seule fois.</span>
      </div>

      <div className="field">
        <label>Titre</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ce soir, mangez malin" />
      </div>

      <div className="field">
        <label>Message</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Des commerçants près de chez vous ont des surprises à sauver avant la fermeture." />
      </div>

      <button className="btn" onClick={send} disabled={sending}>
        {sending ? "Envoi…" : "Envoyer la notification"}
      </button>

      {result && <p className={result.type === "error" ? "error-msg" : "success-msg"}>{result.text}</p>}
    </div>
  );
}
