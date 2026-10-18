/* SKLZ — PWA registration. Loaded by the pages that link manifest.json.
 * Registers the shell-only service worker (see sw.js) and nothing else. */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
  });
})();
