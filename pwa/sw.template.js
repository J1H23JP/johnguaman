// Service worker del portafolio. No se edita a mano: vite.config.js lo genera en cada build
// reemplazando los marcadores de version y de lista de archivos. Estrategia:
//  - al instalar guarda el "esqueleto" completo (HTML, JS, CSS, fuentes, iconos, certificados);
//  - paginas: red primero (siempre la version nueva) y, si no hay conexion, la copia guardada;
//  - /assets/ (nombres con hash): copia primero, nunca cambian;
//  - el resto (CV, fotos de certificados): copia primero y se actualiza en segundo plano.
// Solo atiende GET del mismo origen: el formulario de contacto (FormSubmit) nunca pasa por aqui.

const VERSION = '__VERSION__';
const CACHE = `portafolio-${VERSION}`;
const SCOPE = self.registration.scope;
const PRECACHE = __PRECACHE__.map((u) => new URL(u, SCOPE).href);
const INDEX = new URL('index.html', SCOPE).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('portafolio-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(request), timeout(4500)]);
    if (res && res.ok) cache.put(INDEX, res.clone());
    return res;
  } catch {
    return (await cache.match(INDEX)) || (await cache.match(request)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await refresh) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;
  if (request.headers.has('range')) return; // audio, video o PDF por partes: que los resuelva la red
  if (request.mode === 'navigate') return event.respondWith(networkFirst(request));
  if (url.pathname.includes('/assets/')) return event.respondWith(cacheFirst(request));
  event.respondWith(staleWhileRevalidate(request));
});
