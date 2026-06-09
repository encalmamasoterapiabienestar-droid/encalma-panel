const CACHE_NAME = 'encalma-panel-v1';

const ARCHIVOS_CACHE = [
  '/dashboard.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (
    event.request.url.includes('script.google.com') ||
    event.request.url.includes('sheets.googleapis.com') ||
    event.request.url.includes('workers.dev')
  ) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copia = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
