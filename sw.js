/* Gitarren-Griffbrett-Trainer – Service Worker
   Netzwerk-zuerst fuer Seiten: Neue Versionen kommen sofort an,
   Offline bleibt als Rueckfall moeglich. Ersetzt aeltere Cache-First-SW. */
const VER = '2026-11-01-7';
const CACHE = 'ggt-' + VER;
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
      await self.clients.claim();
    } catch (err) {}
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  try { if (new URL(req.url).origin !== self.location.origin) return; } catch (err) { return; }
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        try { const c = await caches.open(CACHE); c.put(req, net.clone()); } catch (err) {}
        return net;
      } catch (err) {
        try {
          const c = await caches.open(CACHE);
          const hit = await c.match(req) || await c.match(new Request('index.html'));
          if (hit) return hit;
        } catch (err2) {}
        throw err;
      }
    })());
    return;
  }
  e.respondWith((async () => {
    let hit = null;
    try { const c = await caches.open(CACHE); hit = await c.match(req); } catch (err) {}
    try {
      const net = await fetch(req);
      if (net.ok) { try { const c = await caches.open(CACHE); c.put(req, net.clone()); } catch (err) {} }
      return net;
    } catch (err) {
      if (hit) return hit;
      throw err;
    }
  })());
});
