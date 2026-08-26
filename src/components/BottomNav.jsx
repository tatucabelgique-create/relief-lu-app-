import { useI18n } from "../lib/i18n.jsx";

// Icônes ligne simples (pas de dépendance externe), même esprit que la barre
// du bas de TGTG : Découvrir / Favoris / Espace commerçant / Profil.
const icons = {
  discover: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5 5-2z" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  ),
  heart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20s-7-4.35-9.5-8.5C.7 8 2.4 4.5 6 4.5c2 0 3.3 1 4 2.2.7-1.2 2-2.2 4-2.2 3.6 0 5.3 3.5 3.5 7C19 15.65 12 20 12 20z" strokeLinejoin="round" />
    </svg>
  ),
  store: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l1.5-5h15L21 9" strokeLinejoin="round" />
      <path d="M4 9v10h16V9" strokeLinejoin="round" />
      <path d="M9 19v-6h6v6" strokeLinejoin="round" />
      <path d="M3 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
    </svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
    </svg>
  ),
};

// Ouvre le widget Tawk.to (bulle flottante masquée, voir app.html) —
// window.Tawk_API peut ne pas encore exister au tout premier rendu, le
// script se charge de façon asynchrone.
function openChat() {
  window.Tawk_API?.toggle?.();
}

export default function BottomNav({ view, onNavigate }) {
  const { t } = useI18n();

  const items = [
    { key: "public", icon: "discover", label: t("nav.bottom.discover") },
    { key: "browse", icon: "search", label: t("nav.bottom.browse") },
    { key: "favorites", icon: "heart", label: t("nav.favorites") },
    { key: "merchant", icon: "store", label: t("nav.bottom.merchant") },
    { key: "help", icon: "chat", label: t("nav.bottom.help"), action: openChat },
    { key: "account", icon: "profile", label: t("nav.bottom.account") },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`bottom-nav-item ${view === item.key ? "active" : ""}`}
          onClick={() => (item.action ? item.action() : onNavigate(item.key))}
        >
          {icons[item.icon]}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
