import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./lib/leafletIcon";
import "./index.css";
import App from "./App.jsx";

// Bannière "Mise à jour disponible" façon tatuca : jamais de rechargement
// silencieux ni besoin de désinstaller/réinstaller l'app — on prévient
// l'utilisateur et il choisit d'appliquer la nouvelle version.
function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        function trackInstalling(worker) {
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(worker);
            }
          });
        }

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          if (registration.installing) trackInstalling(registration.installing);
        });

        // Vérifie tout de suite, puis à chaque retour au premier plan et
        // régulièrement en arrière-plan — iOS ne le fait pas assez souvent
        // tout seul, surtout pour une PWA relancée depuis l'écran d'accueil.
        registration.update();
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") registration.update();
        });
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch(() => {});

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  if (!waitingWorker) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--navy-2)",
        color: "var(--paper)",
        padding: "10px 14px",
        borderRadius: 12,
        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span style={{ fontSize: 13 }}>Une mise à jour est disponible</span>
      <button
        onClick={() => waitingWorker.postMessage("SKIP_WAITING")}
        style={{
          background: "var(--honey)",
          color: "var(--navy)",
          border: "none",
          borderRadius: 100,
          padding: "6px 12px",
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        Mettre à jour
      </button>
      <button
        onClick={() => setWaitingWorker(null)}
        aria-label="Fermer"
        style={{ background: "none", border: "none", color: "var(--paper-dim)", flexShrink: 0, fontSize: 15 }}
      >
        ✕
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>
);
