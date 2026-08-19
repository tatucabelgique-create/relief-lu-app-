// Même style (ligne/transparent, nos couleurs) que sur la landing page
// (index.html) — voir la même refonte là-bas pour le contexte.
export default function SocialLinks() {
  const iconProps = {
    viewBox: "0 0 48 48",
    width: 24,
    height: 24,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const linkStyle = { lineHeight: 0, color: "var(--paper-dim)" };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <a href="#" aria-label="LinkedIn" style={linkStyle}>
        <svg {...iconProps}>
          <rect x="3" y="3" width="42" height="42" rx="12" />
          <circle cx="18" cy="16.5" r="1.4" fill="currentColor" stroke="none" />
          <path d="M18 21.5V34" />
          <path d="M24.5 34V21.5" />
          <path d="M24.5 26.5c0-2.8 2.1-5 4.8-5s4.7 2.1 4.7 5V34" />
        </svg>
      </a>
      <a href="https://www.instagram.com/relief.lu" target="_blank" rel="noreferrer" aria-label="Instagram" style={linkStyle}>
        <svg {...iconProps}>
          <rect x="3" y="3" width="42" height="42" rx="12" />
          <rect x="13" y="13" width="22" height="22" rx="7" />
          <circle cx="24" cy="24" r="5.6" />
          <circle cx="31" cy="17" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a href="https://www.facebook.com/profile.php?id=61593060962783" target="_blank" rel="noreferrer" aria-label="Facebook" style={linkStyle}>
        <svg {...iconProps}>
          <rect x="3" y="3" width="42" height="42" rx="12" />
          <path d="M31 14h-4a4 4 0 0 0-4 4v16" />
          <path d="M20 23h10" />
        </svg>
      </a>
    </div>
  );
}
