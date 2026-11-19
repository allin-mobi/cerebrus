/* Cerebrus como app del celular (2026-11-18): permite "Agregar a inicio" / "Instalar app".
   La página se busca SIEMPRE primero en internet (así llegan las versiones nuevas); si no hay
   conexión, sale la última guardada. No toca Supabase (los datos van y vienen siempre por internet). */
const CAJON = 'cerebrus-v1';
const BASICO = ['./', 'cerebrus.webmanifest', 'cerebrus-app-180.png', 'cerebrus-app-192.png', 'cerebrus-app-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CAJON).then(c=> c.addAll(BASICO)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=> Promise.all(ks.filter(k=> k !== CAJON).map(k=> caches.delete(k)))).then(()=> self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;   // Supabase, dólar, letras: directo a internet
  // la página: preguntando a GitHub si cambió (si no, contesta 'igual' y no se baja de nuevo)
  const pedido = req.mode === 'navigate' ? fetch(req.url, { cache:'no-cache', credentials:'same-origin' }) : fetch(req);
  e.respondWith(pedido.then(r=>{
    if(r.ok){ const copia = r.clone(); caches.open(CAJON).then(c=> c.put(req, copia)); }
    return r;
  }).catch(()=> caches.match(req).then(r=> r || caches.match('./'))));
});
