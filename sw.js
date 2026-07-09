const CACHE_NAME = "viaje-pamplona-v20";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/data.js",
  "./js/storage.js",
  "./js/profile.js",
  "./js/views/home.js",
  "./js/views/calendario.js",
  "./js/views/actividades.js",
  "./js/views/restaurantes.js",
  "./js/views/compra.js",
  "./js/views/equipaje.js",
  "./js/views/gastos.js",
  "./js/views/info.js",
  "./js/app.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // El clima nunca se cachea: siempre red.
  if (url.hostname.includes("open-meteo.com")) {
    return;
  }

  if (event.request.method !== "GET" || url.origin !== location.origin) {
    return;
  }

  // Red primero (para no servir nunca una versión desactualizada mientras haya
  // conexión), con la caché como respaldo solo cuando no hay red.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
