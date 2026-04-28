// 李志档案 — service worker
// 策略：壳走 cache-first（同源资源）、CDN/封面/字体走 stale-while-revalidate、音频不缓存。

const VERSION = "v7";
const SHELL_CACHE = `lizhi-shell-${VERSION}`;
const RUNTIME_CACHE = `lizhi-runtime-${VERSION}`;

const SHELL = [
  "./",
  "./index.html",
  "./app.jsx",
  "./styles/player.css",
  "./data/songs.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg",
  "./icons/icon-monochrome.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

const AUDIO_RE = /\.(mp3|flac|wav|m4a|ogg|aac)(\?|$)/i;
const RUNTIME_HOSTS = [
  "testingcf.jsdelivr.net",
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "unpkg.com",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 跳过音频流：体积大且支持范围请求，交给浏览器原生
  if (AUDIO_RE.test(url.pathname)) return;

  // 同源：cache-first + 后台更新（壳）
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 受信任的第三方（封面、字体、CDN 脚本）：stale-while-revalidate
  if (RUNTIME_HOSTS.some((h) => url.host === h || url.host.endsWith("." + h))) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(req, { ignoreSearch: false });
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}
