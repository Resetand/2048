/* eslint-disable no-restricted-globals */
const CACHE_NAME = "offline";
const CACHED_FILES = ["favicon.ico", "index.html", "bundle.js", "style.css"];

// for offline mode
self.addEventListener("install", function (e) {
    console.log("[ServiceWorker] Install");
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("[ServiceWorker] Caching app shell");
            return cache.addAll(CACHED_FILES.map((file) => `/2048/dist/${file}`));
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((response) => {
            return response || fetch(event.request);
        })
    );
});
