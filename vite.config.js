import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Servi depuis la racine de relief-lu.online (domaine personnalisé, voir public/CNAME).
  base: process.env.VITE_BASE_PATH || "/",
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
