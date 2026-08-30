import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getConnectOnboardingUrl } from "../lib/stripeConnect";
import { getErrorMessage } from "../lib/auth";

// Sans compte Stripe Connect actif, l'argent des réservations reste
// entièrement sur le compte Stripe de relief.lu — aucun moyen de reverser sa
// part au commerçant (voir schema-v17). Ce panneau est donc la seule porte
// d'entrée vers un vrai reversement automatique, pas une option secondaire.
export default function StripeConnectPanel({ merchant }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setError("");
    setLoading(true);
    try {
      const url = await getConnectOnboardingUrl();
      window.location.href = url;
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  const connected = merchant.stripe_payouts_enabled;

  return (
    <div className="panel">
      <h2>{t("merchant.stripe.title")}</h2>
      <p className="page-sub" style={{ marginBottom: 12 }}>
        {connected ? t("merchant.stripe.connectedDesc") : t("merchant.stripe.pendingDesc")}
      </p>
      {connected ? (
        <span className="chip-pill-outline">✓ {t("merchant.stripe.connected")}</span>
      ) : (
        <button className="btn small" onClick={handleConnect} disabled={loading}>
          {loading ? t("merchant.stripe.redirecting") : t("merchant.stripe.connect")}
        </button>
      )}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}
