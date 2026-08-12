// v2 : force l'invalidation du cache "cache-first" de v1, qui servait une
// version figée de l'app indéfiniment (voir le fetch handler ci-dessous).
const CACHE = "relief-lu-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./app.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

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
  const isHTML = req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    // Réseau en priorité pour les pages HTML : index.html/app.html ne sont pas
    // hashées par le build, donc une réponse mise en cache une fois serait
    // resservie pour toujours — une PWA installée ne verrait jamais les mises
    // à jour. On ne retombe sur le cache qu'en cas d'échec réseau (hors-ligne).
    event.respondWith(
      fetch(req)
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
