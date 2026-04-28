const CACHE_NAME = 'cantoral-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Solo cachear en producción (localhost no cachea)
const isProduction = self.location.hostname !== 'localhost' && !self.location.hostname.includes('127.0.0.1');

self.addEventListener('install', event => {
  if (isProduction) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .catch(err => console.log('Error al cachear:', err))
    );
  }
});

self.addEventListener('fetch', event => {
  if (isProduction) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(() => caches.match('/index.html'))
    );
  }
});

self.addEventListener('activate', event => {
  if (isProduction) {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});