import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Le site est servi depuis /relief-lu-app-/ sur tatucabelgique-create.github.io (pas la racine du domaine),
  // et depuis / une fois le domaine relief.lu branché — voir le workflow de déploiement.
  base: process.env.VITE_BASE_PATH || "/relief-lu-app-/",
  plugins: [react()],
  build: {
    rollupOptions: {
      // index.html (landing/waitlist, statique) et app.html (l'app React)
      // sont deux pages distinctes du même site — pas une SPA unique.
      input: {
        main: resolve(__dirname, "index.html"),
        app: resolve(__dirname, "app.html"),
      },
    },
  },
});
