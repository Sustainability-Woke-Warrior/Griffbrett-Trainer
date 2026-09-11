const CACHE_NAME = 'griffbrett-trainer-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Beim Installieren des Service Workers werden alle wichtigen Dateien
// einmalig in den Cache geladen, damit die App danach auch offline startet.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Alte Cache-Versionen aufräumen, wenn eine neue Version des Service Workers aktiv wird.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Cache-first Strategie: Erst versuchen aus dem Cache zu laden (funktioniert offline),
// nur bei Cache-Miss wird tatsächlich das Netzwerk angefragt.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
