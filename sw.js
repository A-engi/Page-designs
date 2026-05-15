/* RF ATLAS SERVICE WORKER v0.1.54
   Caches the public prototype shell so the app can reopen offline. */

const CACHE_NAME = "rf-atlas-v0.1.54";

const CORE_FILES = [
  "./",
  "./index.html",
  "./shell.css?v=0.1.54",
  "./shell.js?v=0.1.54",
  "./rf.css?v=0.1.54",
  "./rf-demo-map.js",
  "./map.html",
  "./sites.html",
  "./network.html",
  "./tools.html",
  "./dtt.html",
  "./dab.html",
  "./fm.html",
  "./services.html",
  "./equipment.html",
  "./paths.html",
  "./settings.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || caches.match("./index.html")))
  );
});
