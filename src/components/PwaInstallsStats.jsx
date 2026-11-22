import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Admin uniquement (policy "admin can read pwa installs", schema-v34) —
// simple compteur par plateforme, pas de détail par appareil (table
// entièrement anonyme, aucune donnée personnelle à afficher).
export default function PwaInstallsStats() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from("pwa_installs").select("platform");
        if (error) throw error;
        const byPlatform = { ios: 0, android: 0, other: 0 };
        data.forEach((row) => {
          byPlatform[row.platform] = (byPlatform[row.platform] || 0) + 1;
        });
        setCounts(byPlatform);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  if (error) return null;
  if (counts === null) return null;

  const total = counts.ios + counts.android + counts.other;

  return (
    <div className="panel">
      <h2>Installations PWA</h2>
      <p className="page-sub" style={{ marginBottom: 16 }}>
        Nombre d'appareils ayant installé relief.lu sur leur écran d'accueil, par plateforme.
      </p>
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{total}</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>Total</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{counts.ios}</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>iOS</div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{counts.android}</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>Android</div>
        </div>
      </div>
    </div>
  );
}
