import { supabase } from "./supabase";

// Best-effort, jamais bloquant pour l'UI — une erreur réseau ici ne doit
// jamais empêcher ou retarder l'installation elle-même.
export async function logPwaInstall(platform) {
  try {
    await supabase.from("pwa_installs").insert({ platform });
  } catch {
    // silencieux : pur comptage, pas critique
  }
}
