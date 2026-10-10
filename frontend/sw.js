// Service Worker - Toko Berkah Garam (PWA)
// Strategi: halaman & aset lokal = network-first (selalu dapat versi terbaru,
// jatuh ke cache saat offline). CDN (Tailwind, FontAwesome, Chart.js, SheetJS) = stale-while-revalidate.
const CACHE = 'toko-berkah-v4';
const LOCAL_ASSETS = [
  './', './index.html', './kasir.html', './stok.html', './stok-masuk.html',
  './buka-karung.html', './ambil-uang.html', './tutup-kasir.html',
  './buku-bon.html', './laporan.html', './pengaturan.html',
  './db.js', './auth.js', './printer.js', './pwa.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(LOCAL_ASSETS.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Jangan cache panggilan API Supabase (data harus selalu segar / lewat DAL)
  if (url.hostname.endsWith('supabase.co')) return;

  const isLocal = url.origin === self.location.origin;

  if (isLocal) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetching = fetch(req).then((res) => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fetching;
      })
    );
  }
});
