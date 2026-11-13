/* SKLZ Labs service worker — installability + offline shell only.
 *
 * Deliberately conservative: pages and API calls always go to the network
 * (a trading dashboard must never show a stale P/L from cache). Only the
 * static shell (logo, icons, manifest, i18n, mobile css) is cached, and the
 * offline fallback is a plain page that says so. Bump VERSION to invalidate.
 */
const VERSION = 'sklz-shell-v2';
const SHELL = ['/sklz-logo.png', '/icons/icon-192.png', '/icons/icon-512.png',
               '/manifest.json', '/sklz-i18n.js', '/sklz-mobile.css', '/sklz-mobile.js', '/offline.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // never touch the API or anything cross-origin
  if (url.origin !== self.location.origin) return;
  const isShell = SHELL.includes(url.pathname);
  if (isShell) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
  }
});
