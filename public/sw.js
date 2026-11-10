const STATIC_CACHE = 'sistema-dental-static-v1.4'; 
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/PWA.png',
  '/favicon.ico',
];

// Cache writes are skipped for non-HTTP(S) requests to avoid extension-scheme errors
function safeCachePut(cacheName, request, response) {
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  caches.open(cacheName).then((cache) => cache.put(request, response)).catch(() => {});
}

// Función para verificar si una URL debe cachearse
function shouldCacheRequest(request) {
  const url = new URL(request.url);
  
  // NO cachear extensiones del navegador
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-web-extension:' ||
      url.protocol === 'file:' ||
      url.protocol === 'blob:' ||
      url.protocol === 'data:') {
    return false;
  }
  
  // Solo cachear HTTP/HTTPS
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }
  
  // No cachear requests a Supabase Auth (sesiones sensibles)
  if (url.pathname.includes('/auth/') && url.hostname.includes('supabase.co')) {
    return false;
  }

  // No cachear datos dinámicos (API Next o Supabase REST/Storage) para evitar vistas desactualizadas
  const isDataRequest =
    url.pathname.startsWith('/api/') ||
    (url.hostname.includes('supabase.co') &&
      (url.pathname.includes('/rest/v1') || url.pathname.includes('/storage/v1')));
  if (isDataRequest) {
    return false;
  }
  
  // Cachear solo tu dominio y recursos necesarios
  const allowedHostnames = [
    self.location.hostname, // Tu dominio
    'fakzwsxqcwdlzwv.supabase.co', // Tu Supabase
    '*.vercel.app',
  ];
  
  return allowedHostnames.some(domain => {
    if (domain.startsWith('*.')) {
      return url.hostname.endsWith(domain.slice(2));
    }
    return url.hostname === domain;
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== STATIC_CACHE) {
              return caches.delete(key);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo procesar GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Verificar si esta request debe cachearse
  if (!shouldCacheRequest(request)) {
    // Si no debe cachearse, simplemente fetch sin cache
    event.respondWith(fetch(request));
    return;
  }

  // HTML navigation requests: network first, then offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear si la respuesta es exitosa
          if (response.status === 200) {
            const copy = response.clone();
            safeCachePut(STATIC_CACHE, request, copy);
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static assets and API GET: cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          // Solo cachear si la respuesta es exitosa
          if (response.status === 200) {
            const copy = response.clone();
            safeCachePut(STATIC_CACHE, request, copy);
          }
          return response;
        })
        .catch(() => {
          // Si fetch falla y no hay cache, devuelve null
          return null;
        });
    })
  );
});