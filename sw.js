// Keeps lessons working on lab PCs when the internet drops.
// Change the version number whenever you update the site, so students get the new files.
const CACHE = "digyaan-v1";
const FILES = [
  "./",
  "index.html",
  "css/style.css",
  "js/i18n.js",
  "js/lessons.js",
  "js/app.js",
  "icon.svg",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).pathname.startsWith("/api/")) return; // AI questions always go online
  // Network first (fresh content), fall back to the saved copy when offline.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
  );
});
