const CACHE_NAME = 'encalma-v2';

// Archivos esenciales para instalar
const PRECACHE = [
  'dashboard.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// INSTALL — precachea archivos base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE — limpia cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// FETCH — obligatorio y explícito para que Chrome lo reconozca como PWA
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Dejar pasar llamadas a APIs externas sin interceptar
  if (
    url.includes('script.google.com') ||
    url.includes('googleapis.com') ||
    url.includes('workers.dev') ||
    url.includes('fonts.g')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network first, caché como fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
