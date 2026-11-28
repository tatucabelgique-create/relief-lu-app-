import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { addReview } from "../lib/reviews";

const CRITERIA = ["collecte", "qualite", "variete", "quantite"];

function StarPicker({ value, onChange }) {
  return (
    <div className="stars" style={{ fontSize: 22, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} onClick={() => onChange(n)}>
          {n <= value ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function ReviewForm({ reservation, onClose, onSubmitted }) {
  const { t } = useI18n();
  const [scores, setScores] = useState({ collecte: 5, qualite: 5, variete: 5, quantite: 5 });
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  // Même pattern que LegalModal.jsx (voir .overlay.closing dans index.css).
  const [closing, setClosing] = useState(false);
  function requestClose() {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 220);
  }

  if (!reservation) return null;

  function setScore(key, value) {
    setScores((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit() {
    setError("");
    try {
      const overall = Math.round((scores.collecte + scores.qualite + scores.variete + scores.quantite) / 4);
      await addReview(reservation.id, reservation.bags.merchant_id, overall, comment.trim(), scores);
      onSubmitted();
      requestClose();
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    }
  }

  return (
    <div className={`overlay ${closing ? "closing" : "open"}`} onClick={(e) => e.target === e.currentTarget && requestClose()}>
      <div className="modal">
        <button className="close" onClick={requestClose}>
          ✕
        </button>
        <h2>{t("review.title")}</h2>
        <p className="desc">{reservation.bags?.title}</p>
        {CRITERIA.map((key) => (
          <div className="field" key={key}>
            <label>{t(`review.criteria.${key}`)}</label>
            <StarPicker value={scores[key]} onChange={(v) => setScore(key, v)} />
          </div>
        ))}
        <div className="field">
          <label>{t("review.comment")}</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("review.commentPlaceholder")} />
        </div>
        <button className="btn" onClick={handleSubmit}>
          {t("review.submit")}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}
