// En Calma – Service Worker
// Versión: incrementá este número cada vez que actualices el dashboard
const CACHE_NAME = 'encalma-panel-v1';

const ARCHIVOS_CACHE = [
  '/encalma-panel/dashboard.html',
  '/encalma-panel/manifest.json',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap'
];

// Instalación: guarda los archivos clave en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpia cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: red primero, caché como fallback
self.addEventListener('fetch', event => {
  // No interceptar llamadas a Google Sheets / Apps Script (siempre necesitan red)
  if (
    event.request.url.includes('script.google.com') ||
    event.request.url.includes('sheets.googleapis.com') ||
    event.request.url.includes('workers.dev')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red responde, actualizá el caché
        const copia = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
        return response;
      })
      .catch(() => {
        // Sin red: servir desde caché
        return caches.match(event.request);
      })
  );
});
