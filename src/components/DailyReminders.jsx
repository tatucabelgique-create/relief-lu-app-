import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { isDailyReminderEnabled, getDailyReminderDays, setDailyReminderDays } from "../lib/dailyReminders";
import { isPushSupported } from "../lib/push";

// Jours ISO (1 = lundi ... 7 = dimanche).
const DAYS = [
  { iso: 1, key: "dailyReminder.mon" },
  { iso: 2, key: "dailyReminder.tue" },
  { iso: 3, key: "dailyReminder.wed" },
  { iso: 4, key: "dailyReminder.thu" },
  { iso: 5, key: "dailyReminder.fri" },
  { iso: 6, key: "dailyReminder.sat" },
  { iso: 7, key: "dailyReminder.sun" },
];

// Rappel générique (façon TGTG) : indépendant des favoris/villes, juste "n'oublie
// pas de sauver un panier aujourd'hui" les jours choisis. Masqué tant que le
// feature flag "daily_reminders" n'est pas activé côté admin (voir DailyReminderToggle.jsx) —
// volontaire, pour ne pas pousser les gens vers une app encore trop vide de paniers.
export default function DailyReminders({ user }) {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(null);
  const [days, setDays] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    isDailyReminderEnabled()
      .then(setEnabled)
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!user || !enabled) return;
    getDailyReminderDays(user.id)
      .then(setDays)
      .catch(() => setDays(new Set()));
  }, [user, enabled]);

  if (!user || !enabled || !isPushSupported() || days === null) return null;

  async function toggle(iso) {
    setPending(iso);
    const next = new Set(days);
    if (next.has(iso)) next.delete(iso);
    else next.add(iso);
    try {
      await setDailyReminderDays(user.id, next);
      setDays(next);
    } catch {
      // best-effort — l'état affiché reste inchangé si l'appel échoue.
    }
    setPending(null);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <p className="page-sub" style={{ marginBottom: 10 }}>{t("dailyReminder.hint")}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {DAYS.map(({ iso, key }) => (
          <button
            key={iso}
            className={`chip-pill-outline${days.has(iso) ? " active" : ""}`}
            style={{
              cursor: "pointer",
              border: "1px solid rgba(239,230,211,0.3)",
              background: days.has(iso) ? "var(--honey)" : "transparent",
              color: days.has(iso) ? "var(--navy)" : "var(--paper)",
              opacity: pending === iso ? 0.6 : 1,
              minWidth: 44,
              textAlign: "center",
            }}
            disabled={pending === iso}
            onClick={() => toggle(iso)}
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  );
}
