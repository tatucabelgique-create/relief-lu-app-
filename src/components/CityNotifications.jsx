import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { LUXEMBOURG_CITIES } from "../lib/cities";
import { getCitySubscriptions, subscribeToCity, unsubscribeFromCity } from "../lib/cityNotifications";
import { isPushSupported } from "../lib/push";

// Complète les favoris (liés à un commerçant précis déjà connu) : ici, on
// s'abonne à une ville entière pour être alerté dès qu'un panier y est
// publié, même par un commerçant qu'on ne suit pas encore.
export default function CityNotifications({ user }) {
  const { t } = useI18n();
  const [cities, setCities] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (!user) return;
    getCitySubscriptions(user.id)
      .then(setCities)
      .catch(() => setCities(new Set()));
  }, [user]);

  if (!user || !isPushSupported() || cities === null) return null;

  async function toggle(city) {
    setPending(city);
    const next = new Set(cities);
    try {
      if (next.has(city)) {
        await unsubscribeFromCity(user.id, city);
        next.delete(city);
      } else {
        await subscribeToCity(user.id, city);
        next.add(city);
      }
      setCities(next);
    } catch {
      // best-effort — l'état affiché reste inchangé si l'appel échoue.
    }
    setPending(null);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <p className="page-sub" style={{ marginBottom: 10 }}>{t("cityNotif.hint")}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {LUXEMBOURG_CITIES.map((city) => (
          <button
            key={city}
            className={`chip-pill-outline${cities.has(city) ? " active" : ""}`}
            style={{
              cursor: "pointer",
              border: "1px solid rgba(239,230,211,0.3)",
              background: cities.has(city) ? "var(--honey)" : "transparent",
              color: cities.has(city) ? "var(--navy)" : "var(--paper)",
              opacity: pending === city ? 0.6 : 1,
            }}
            disabled={pending === city}
            onClick={() => toggle(city)}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}
