// Mêmes icônes (couleurs officielles) que sur la landing page (index.html).
export default function SocialLinks() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <a href="#" aria-label="Instagram" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 48 48" width="24" height="24">
          <defs>
            <radialGradient id="ig-grad-app" cx="30%" cy="107%" r="150%">
              <stop offset="0" stopColor="#fdf497" />
              <stop offset="0.05" stopColor="#fdf497" />
              <stop offset="0.45" stopColor="#fd5949" />
              <stop offset="0.6" stopColor="#d6249f" />
              <stop offset="0.9" stopColor="#285AEB" />
            </radialGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#ig-grad-app)" />
          <rect x="12" y="12" width="24" height="24" rx="7" fill="none" stroke="#fff" strokeWidth="2.4" />
          <circle cx="24" cy="24" r="6.2" fill="none" stroke="#fff" strokeWidth="2.4" />
          <circle cx="31.6" cy="16.4" r="1.6" fill="#fff" />
        </svg>
      </a>
      <a href="https://www.facebook.com/profile.php?id=61593060962783" target="_blank" rel="noreferrer" aria-label="Facebook" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 48 48" width="24" height="24">
          <rect width="48" height="48" rx="12" fill="#1877F2" />
          <path
            d="M27.5 42V25.9h5.4l0.8-6.3h-6.2v-4c0-1.8 0.5-3.1 3.1-3.1h3.3V6.9c-0.6-0.1-2.5-0.3-4.8-0.3-4.8 0-8 2.9-8 8.2v4.6h-5.4v6.3h5.4V42h6.4z"
            fill="#fff"
          />
        </svg>
      </a>
    </div>
  );
}
