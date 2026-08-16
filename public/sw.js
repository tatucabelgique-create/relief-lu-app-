// __BUILD_ID__ est remplacé par le SHA du commit à chaque build (voir
// .github/workflows/deploy.yml) — ce fichier change donc toujours d'un
// déploiement à l'autre, ce qui déclenche systématiquement la détection de
// mise à jour et la bannière "Mettre à jour" (voir UpdatePrompt, main.jsx).
// Avant ce changement, la bannière ne s'affichait que si sw.js changeait
// "à la main" ; sans ça, une mise à jour du bundle React seul ne
// déclenchait rien côté service worker, et Safari/iOS pouvait resservir
// une page en cache disque avant même que le SW n'intercepte la requête.
const CACHE = "relief-lu-__BUILD_ID__";
// index.html/app.html ne sont volontairement PAS préchargées ici : elles
// doivent toujours passer par le réseau-prioritaire du fetch handler
// ci-dessous, jamais servies depuis une version figée au moment de
// l'installation du service worker (voir isHTML plus bas — la détection
// se fait sur le chemin de l'URL, pas sur req.mode/Accept qui peuvent ne
// pas être fiables selon le navigateur, ex. Safari/iOS).
const ASSETS = ["./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  // Pas de skipWaiting() ici : le nouveau service worker reste en attente
  // jusqu'à ce que l'utilisateur clique "Mettre à jour" dans la bannière
  // (voir UpdatePrompt dans main.jsx) — jamais de bascule silencieuse.
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Le Cache API ne gère que les requêtes GET — laisser passer directement
  // au réseau tout le reste (POST vers les fonctions Edge Supabase pour le
  // paiement, etc.), sinon caches.match() sur une requête POST fait planter
  // toute la requête côté Safari ("FetchEvent.respondWith received an error").
  if (req.method !== "GET") return;

  // Basé sur le chemin de l'URL plutôt que req.mode/Accept : ces derniers ne
  // sont pas toujours fiables selon le navigateur (Safari/iOS notamment),
  // et une détection ratée faisait retomber app.html sur la branche
  // cache-first plus bas — la version figée à l'installation du SW, jamais
  // rafraîchie, quel que soit le nombre de mises à jour déployées depuis.
  const url = new URL(req.url);
  const isHTML = url.pathname.endsWith(".html") || url.pathname.endsWith("/");

  if (isHTML) {
    // Réseau en priorité pour les pages HTML : index.html/app.html ne sont pas
    // hashées par le build, donc une réponse mise en cache une fois serait
    // resservie pour toujours — une PWA installée ne verrait jamais les mises
    // à jour. On ne retombe sur le cache qu'en cas d'échec réseau (hors-ligne).
    // cache: "no-store" ignore aussi le cache HTTP du navigateur — GitHub Pages
    // sert app.html avec "Cache-Control: max-age=600", donc sans ça, un simple
    // fetch() pouvait resservir une réponse vieille de 10 min sans repasser réseau.
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Le reste (JS/CSS hashés par le build, icônes...) : sûr à servir depuis le
  // cache en priorité, le nom de fichier change si le contenu change.
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

self.addEventListener("push", (event) => {
  let payload = { title: "Relief.lu", body: "Nouveau sachet disponible !" };
  if (event.data) {
    try { payload = { ...payload, ...event.data.json() }; } catch { payload.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      data: { url: payload.url || "./app.html" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "./app.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
