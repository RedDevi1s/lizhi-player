// 李志档案 — service worker
// 策略：壳走 cache-first（同源资源）、CDN/封面/字体走 stale-while-revalidate、
// 音频走"已下载 → cache-first（带 Range 切片）"，未下载则放行让浏览器流式播放。

const VERSION = "v9";
const SHELL_CACHE = `lizhi-shell-${VERSION}`;
const RUNTIME_CACHE = `lizhi-runtime-${VERSION}`;
// 音频缓存名不带 VERSION：壳升级时不丢用户已下载的歌
const AUDIO_CACHE = "lizhi-audio-v1";

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
            .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE && k !== AUDIO_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") { self.skipWaiting(); return; }
  // Page asks: "what version are you running?" — reply over the supplied port.
  if (event.data && event.data.type === "VERSION") {
    const port = event.ports && event.ports[0];
    if (port) port.postMessage(VERSION);
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 音频：先看 audio cache。命中就本地服务（处理 Range），否则放行让浏览器流式播。
  if (AUDIO_RE.test(url.pathname)) {
    event.respondWith(serveAudio(req));
    return;
  }

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

// 音频：未缓存就转发网络；已缓存就由 SW 提供，并手动处理 Range 让 audio 能 seek。
async function serveAudio(req) {
  const cache = await caches.open(AUDIO_CACHE);
  // 用裸 URL 做 key —— audio 请求会带 Range header，匹配时忽略
  const keyReq = new Request(req.url);
  const cached = await cache.match(keyReq);
  if (!cached) {
    // 未缓存：原样转发，浏览器会自己做 Range 流式播放
    return fetch(req);
  }
  const range = req.headers.get("Range") || req.headers.get("range");
  if (!range) {
    // 没有 Range，直接返回完整响应
    return cached;
  }
  return sliceResponse(cached, range);
}

async function sliceResponse(response, rangeHeader) {
  const buffer = await response.clone().arrayBuffer();
  const size = buffer.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!m) return response;
  let start = m[1] === "" ? 0 : parseInt(m[1], 10);
  let end = m[2] === "" ? size - 1 : parseInt(m[2], 10);
  if (isNaN(start) || isNaN(end) || start > end || end >= size) {
    return new Response(null, {
      status: 416,
      statusText: "Range Not Satisfiable",
      headers: { "Content-Range": `bytes */${size}` },
    });
  }
  const slice = buffer.slice(start, end + 1);
  const headers = new Headers(response.headers);
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(slice.byteLength));
  headers.set("Accept-Ranges", "bytes");
  return new Response(slice, {
    status: 206,
    statusText: "Partial Content",
    headers,
  });
}
