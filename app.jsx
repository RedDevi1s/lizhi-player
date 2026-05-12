/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const ALBUMS = window.__LIZHI_ALBUMS;
const ALL_TRACKS = window.__LIZHI_RAW;

// ---- blurbs for albums (short, literary)
const ALBUM_BLURBS = {
  "被禁忌的游戏": "2004 · 首张个人专辑。潮湿的、不安的、青涩的，一个未成名歌手的私人档案。",
  "梵高先生": "2005 · 南京民谣的一个坐标。关于他，关于她，关于那间租来的房间。",
  "这个世界会好吗": "2007 · 一个问句，也是一句答复。",
  "我爱南京": "2009 · 现场录音。跨年夜、麦克风、一把吉他的回声。",
  "工体东路没有人": "2010 · 北京现场。空旷的街道，散场后的灯。",
  "我们也爱南京": "2010 · 再次回到这座城市。",
  "在每一条伤心的应天大街上": "2010 · 第四张录音室作品。应天大街、夏天、少年人的失败。",
  "你好，郑州": "2011 · 路过的城市也要说声你好。",
  "Imagine-2011": "2011 · 跨年现场。所有过去的歌重新被演奏。",
  "F": "2012 · 第五张录音室作品。",
  "108个关键词": "2012 · 跨年现场。108个关键词指向同一个人。",
  "1701": "2013 · 跨年现场。数字作为标题，指向一间排练房。",
  "勾三搭四": "2014 · 不插电合辑。一把木吉他把旧歌重新说一遍。",
  "二零零九年十月十六日事件": "2009 · 一个晚上的全部记录。",
  "io": "2014 · 跨年现场。输入和输出之间的距离。",
  "看见": "2014 · 合辑。被看见的，和没被看见的。",
  "动静": "2015 · 第六张录音室作品。有动有静，有所保留。",
  "广场合集": "2015 · 《广场》一首歌的所有版本。",
  "家": "2016 · 第七张录音室作品。",
  "8": "2016 · 儿歌合辑。童年回不去，但可以唱。",
  "电声与管弦乐": "2017 · 编曲实验。民谣被放入更大的器皿。",
  "电声与管弦乐II": "2017 · 相信未来现场。",
  "北京不插电": "2018 · 最后一次北京现场。",
  "零碎": "散落的单曲、合作、现场。"
};

// ---- icons
const I = {
  play: (s={}) => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:s.size||18,height:s.size||18}}><path d="M7 4.5v15l13-7.5L7 4.5z"/></svg>,
  pause: (s={}) => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:s.size||18,height:s.size||18}}><rect x="6" y="4.5" width="4" height="15"/><rect x="14" y="4.5" width="4" height="15"/></svg>,
  prev: () => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M6 5v14h2V5H6zm3 7l10 7V5l-10 7z"/></svg>,
  next: () => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M16 5v14h2V5h-2zM5 19l10-7L5 5v14z"/></svg>,
  shuffle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M3 6h3l10 12h5M3 18h3l2.5-3M16 6h5M14.5 9l1.5-3M18 3l3 3-3 3M18 15l3 3-3 3"/></svg>,
  repeat: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><path d="M17 2l3 3-3 3M4 11V9a4 4 0 014-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 01-4 4H4"/></svg>,
  vol: () => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1-3.29-2.5-4.03v8.05c1.5-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71 0 3.17-2.11 5.85-5 6.71v2.06c4-.91 7-4.49 7-8.77 0-4.28-3-7.86-7-8.77z"/></svg>,
  mute: () => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><path d="M7 9v6h4l5 5V4l-5 5H7zm13.59 3L23 9.41 21.59 8 19 10.59 16.41 8 15 9.41 17.59 12 15 14.59 16.41 16 19 13.41 21.59 16 23 14.59 20.59 12z"/></svg>,
  list: () => <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>,
  search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:16,height:16}}><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.5-4.5"/></svg>,
  x: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:14,height:14}}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  cloud: (s={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{width:s.size||14,height:s.size||14}}><path d="M7 18a4 4 0 010-8 5.5 5.5 0 0110.6 1.2A3.5 3.5 0 0117 18H7z"/><path d="M12 11v6m0 0l-2.5-2.5M12 17l2.5-2.5" strokeLinecap="round"/></svg>,
  check: (s={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{width:s.size||14,height:s.size||14}}><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash: (s={}) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:s.size||14,height:s.size||14}}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" strokeLinecap="round"/></svg>
};

// ---- offline cache helpers
const AUDIO_CACHE_NAME = "lizhi-audio-v1";
const cacheSupported = typeof caches !== "undefined";

// `cache.keys()` returns Request objects whose `.url` is percent-encoded;
// raw URLs in songs.js are CJK-literal. Normalize so the two forms match.
const normUrl = (u) => {
  try { return new URL(u, location.href).href; } catch { return u; }
};

async function listCachedUrls() {
  if (!cacheSupported) return new Set();
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const keys = await cache.keys();
    return new Set(keys.map(r => r.url));
  } catch { return new Set(); }
}

async function deleteCachedUrl(url) {
  if (!cacheSupported) return false;
  const cache = await caches.open(AUDIO_CACHE_NAME);
  return cache.delete(url);
}

async function clearAudioCache() {
  if (!cacheSupported) return;
  await caches.delete(AUDIO_CACHE_NAME);
}

// Streams a remote audio file into the cache, reporting progress 0..1.
async function downloadToCache(url, onProgress, signal) {
  if (!cacheSupported) throw new Error("当前浏览器不支持离线缓存");
  const cache = await caches.open(AUDIO_CACHE_NAME);
  if (await cache.match(url)) return; // already there
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const total = parseInt(res.headers.get("Content-Length") || "0", 10);
  const reader = res.body?.getReader();
  if (!reader) {
    await cache.put(url, res.clone());
    onProgress?.(1);
    return;
  }
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) onProgress?.(received / total);
  }
  const blob = new Blob(chunks);
  // Rebuild a 200 OK Response — SW will slice it for Range requests on playback
  const headers = new Headers();
  const ct = res.headers.get("Content-Type");
  if (ct) headers.set("Content-Type", ct);
  headers.set("Content-Length", String(blob.size));
  headers.set("Accept-Ranges", "bytes");
  await cache.put(url, new Response(blob, { status: 200, headers }));
  onProgress?.(1);
}

const fmtBytes = (n) => {
  if (!n || !isFinite(n)) return "0 B";
  const u = ["B","KB","MB","GB"];
  let i = 0; let x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
};

// ---- helpers
const fmt = (s) => {
  if (!isFinite(s) || s < 0) return "—:—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};
const romanize = (n) => {
  const roman = ["","Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ","Ⅵ","Ⅶ","Ⅷ","Ⅸ","Ⅹ","Ⅺ","Ⅻ","ⅩⅢ","ⅩⅣ","ⅩⅤ","ⅩⅥ","ⅩⅦ","ⅩⅧ","ⅩⅨ","ⅩⅩ","ⅩⅪ","ⅩⅫ","ⅩⅩⅢ","ⅩⅩⅣ","ⅩⅩⅤ","ⅩⅩⅥ","ⅩⅩⅦ","ⅩⅩⅧ","ⅩⅩⅨ","ⅩⅩⅩ"];
  return roman[n] || String(n);
};

// ---- highlight substring in text
function Highlight({ text, q }) {
  const query = (q || "").trim();
  if (!query) return text;
  const lower = text.toLowerCase();
  const ql = query.toLowerCase();
  const idx = lower.indexOf(ql);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="hl">{text.slice(idx, idx + ql.length)}</mark>
      {text.slice(idx + ql.length)}
    </>
  );
}

// ---- main app
function App() {
  const [selectedAlbumIdx, setSelectedAlbumIdx] = useState(0);
  const album = ALBUMS[selectedAlbumIdx];

  // queue = current album's tracks (plus optional shuffle)
  const [queueAlbumIdx, setQueueAlbumIdx] = useState(0);
  const [queueIdx, setQueueIdx] = useState(0);
  const queueAlbum = ALBUMS[queueAlbumIdx];

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off / one / all
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rail, setRail] = useState("queue"); // queue / notes / poem
  const [focus, setFocus] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(null); // null | "albums" | "rail"
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  // offline cache state
  const [cachedUrls, setCachedUrls] = useState(() => new Set());
  const [downloads, setDownloads] = useState({}); // url -> 0..1 progress (in-flight only)
  const [storage, setStorage] = useState({ usage: 0, quota: 0 });
  const downloadAbortRef = useRef(new Map()); // url -> AbortController

  // known track durations (sec), keyed by normalized URL — persisted so a refresh
  // doesn't reset everything we already learned.
  const [durations, setDurations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lizhi-durations") || "{}"); }
    catch { return {}; }
  });
  const probeRef = useRef({ pending: [], active: 0, seen: new Set() });

  // service-worker update banner
  const [updateReady, setUpdateReady] = useState(false);
  const [appVersion, setAppVersion] = useState(null);
  const swRegRef = useRef(null);

  const audioRef = useRef(null);

  const track = queueAlbum.tracks[queueIdx];

  // Focus mode attr
  useEffect(() => {
    document.body.dataset.focus = focus ? "1" : "0";
  }, [focus]);

  // load track
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    setCurrent(0);
    setDuration(0);
    setBuffered(0);
    setLoading(true);
    setError("");
    a.src = track.url;
    a.volume = muted ? 0 : volume;
    a.load();
  }, [queueAlbumIdx, queueIdx]);

  // play/pause sync
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.play().catch((e) => {
        if (e?.name === "AbortError") return;
        setError("播放失败");
        setPlaying(false);
      });
    } else {
      a.pause();
    }
  }, [playing, queueAlbumIdx, queueIdx]);

  // volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // auto-clear toast
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 3200);
    return () => clearTimeout(t);
  }, [error]);

  const selectTrack = (albumIdx, tIdx) => {
    setQueueAlbumIdx(albumIdx);
    setQueueIdx(tIdx);
    setPlaying(true);
  };

  const togglePlay = () => setPlaying(p => !p);

  const nextTrack = useCallback(() => {
    if (repeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    const len = queueAlbum.tracks.length;
    if (shuffle) {
      let n;
      do { n = Math.floor(Math.random() * len); } while (n === queueIdx && len > 1);
      setQueueIdx(n);
    } else {
      if (queueIdx + 1 < len) {
        setQueueIdx(queueIdx + 1);
      } else if (repeat === "all") {
        setQueueIdx(0);
      } else {
        setPlaying(false);
      }
    }
  }, [queueIdx, queueAlbum, shuffle, repeat]);

  const prevTrack = () => {
    if (current > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const len = queueAlbum.tracks.length;
    if (queueIdx > 0) setQueueIdx(queueIdx - 1);
    else setQueueIdx(len - 1);
  };

  const onTimeUpdate = (e) => {
    setCurrent(e.target.currentTime);
    const b = e.target.buffered;
    if (b.length) setBuffered(b.end(b.length - 1));
  };
  const onMeta = (e) => {
    const d = e.target.duration;
    setDuration(d); setLoading(false);
    if (track) recordDuration(normUrl(track.url), d);
  };
  const onEnded = () => nextTrack();
  const onWait = () => setLoading(true);
  const onCanPlay = () => setLoading(false);
  const onErr = () => { setError("音频加载失败"); setLoading(false); setPlaying(false); };

  const seek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = Math.max(0, Math.min(duration, duration * pct));
  };
  const setVol = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(pct); setMuted(false);
  };

  // ---- offline cache: scan on mount + when window regains focus
  const refreshCache = useCallback(async () => {
    setCachedUrls(await listCachedUrls());
    if (navigator.storage?.estimate) {
      try {
        const est = await navigator.storage.estimate();
        setStorage({ usage: est.usage || 0, quota: est.quota || 0 });
      } catch {}
    }
  }, []);

  const recordDuration = useCallback((key, d) => {
    if (!isFinite(d) || d <= 0) return;
    setDurations(prev => {
      if (prev[key] === d) return prev;
      const next = { ...prev, [key]: d };
      try { localStorage.setItem("lizhi-durations", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Concurrency-limited probe queue: spin up at most 3 throwaway <audio> elements
  // with preload=metadata to read duration without playing the file.
  const pumpProbe = useCallback(() => {
    const q = probeRef.current;
    while (q.active < 3 && q.pending.length) {
      const item = q.pending.shift();
      q.active++;
      const a = new Audio();
      a.preload = "metadata";
      const finish = () => {
        a.removeEventListener("loadedmetadata", onMeta);
        a.removeEventListener("error", onErr);
        try { a.src = ""; } catch {}
        q.active--;
        setTimeout(() => pumpProbe(), 0);
      };
      const onMeta = () => { recordDuration(item.key, a.duration); finish(); };
      const onErr = () => finish();
      a.addEventListener("loadedmetadata", onMeta);
      a.addEventListener("error", onErr);
      a.src = item.url;
    }
  }, [recordDuration]);

  const probeDuration = useCallback((url) => {
    const key = normUrl(url);
    const q = probeRef.current;
    if (q.seen.has(key)) return;
    q.seen.add(key);
    q.pending.push({ url, key });
    pumpProbe();
  }, [pumpProbe]);

  useEffect(() => {
    refreshCache();
    const onFocus = () => refreshCache();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshCache]);

  // Once cache set is known, schedule duration probes for everything that's
  // cached but not yet measured. Cheap because SW serves these from the cache.
  useEffect(() => {
    if (!cachedUrls.size) return;
    cachedUrls.forEach((u) => {
      if (durations[u] == null) probeDuration(u);
    });
  }, [cachedUrls, durations, probeDuration]);

  // service-worker update detection + version query
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let cancelled = false;
    const askVersion = () => {
      const ctrl = navigator.serviceWorker.controller;
      if (!ctrl) return;
      const ch = new MessageChannel();
      ch.port1.onmessage = (e) => { if (!cancelled) setAppVersion(e.data); };
      try { ctrl.postMessage({ type: "VERSION" }, [ch.port2]); } catch {}
    };
    askVersion();
    const onCtrlChange = () => askVersion();
    navigator.serviceWorker.addEventListener("controllerchange", onCtrlChange);

    const watch = (nw) => {
      if (!nw) return;
      nw.addEventListener("statechange", () => {
        // new SW finished installing while a controller already exists → it's an update, not first install
        if (nw.state === "installed" && navigator.serviceWorker.controller && !cancelled) {
          setUpdateReady(true);
        }
      });
    };
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg || cancelled) return;
      swRegRef.current = reg;
      if (reg.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
      if (reg.installing) watch(reg.installing);
      reg.addEventListener("updatefound", () => watch(reg.installing));
      // proactive poll: re-check on focus + every 30 min
      const tick = () => reg.update().catch(() => {});
      const onFocus = () => tick();
      window.addEventListener("focus", onFocus);
      const id = setInterval(tick, 30 * 60 * 1000);
      return () => { window.removeEventListener("focus", onFocus); clearInterval(id); };
    });
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onCtrlChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    // sw.js already calls skipWaiting() in install, so a fresh SW shouldn't sit in waiting;
    // but if one does (e.g. older deploy), nudge it before reload.
    const reg = swRegRef.current;
    if (reg?.waiting) reg.waiting.postMessage("SKIP_WAITING");
    window.location.reload();
  }, []);

  const startDownload = useCallback(async (url) => {
    if (!url) return;
    const key = normUrl(url);
    if (cachedUrls.has(key)) return;
    if (downloadAbortRef.current.has(key)) return; // already in flight
    const ctrl = new AbortController();
    downloadAbortRef.current.set(key, ctrl);
    setDownloads(d => ({ ...d, [key]: 0 }));
    try {
      await downloadToCache(url, (p) => {
        setDownloads(d => ({ ...d, [key]: p }));
      }, ctrl.signal);
      setCachedUrls(prev => new Set(prev).add(key));
      if (navigator.storage?.estimate) {
        try {
          const est = await navigator.storage.estimate();
          setStorage({ usage: est.usage || 0, quota: est.quota || 0 });
        } catch {}
      }
    } catch (e) {
      if (e?.name !== "AbortError") setError("下载失败：" + (e?.message || e));
    } finally {
      downloadAbortRef.current.delete(key);
      setDownloads(d => {
        const { [key]: _, ...rest } = d;
        return rest;
      });
    }
  }, [cachedUrls]);

  const cancelDownload = useCallback((url) => {
    const ctrl = downloadAbortRef.current.get(normUrl(url));
    if (ctrl) ctrl.abort();
  }, []);

  const removeDownload = useCallback(async (url) => {
    const key = normUrl(url);
    await deleteCachedUrl(url);
    setCachedUrls(prev => {
      const n = new Set(prev); n.delete(key); return n;
    });
    refreshCache();
  }, [refreshCache]);

  const downloadAlbum = useCallback(async (alb) => {
    for (const t of alb.tracks) {
      const key = normUrl(t.url);
      if (!cachedUrls.has(key) && !downloadAbortRef.current.has(key)) {
        // eslint-disable-next-line no-await-in-loop
        await startDownload(t.url);
      }
    }
  }, [cachedUrls, startDownload]);

  const cancelAlbum = useCallback((alb) => {
    for (const t of alb.tracks) {
      if (downloadAbortRef.current.has(normUrl(t.url))) cancelDownload(t.url);
    }
  }, [cancelDownload]);

  const downloadAll = useCallback(async () => {
    const remaining = ALL_TRACKS.filter(t => !cachedUrls.has(normUrl(t.url))).length;
    if (!remaining) return;
    if (!window.confirm(`即将下载 ${remaining} 首曲目到本地，可能占用数 GB 存储且耗时较长。继续？`)) return;
    for (const t of ALL_TRACKS) {
      const key = normUrl(t.url);
      if (!cachedUrls.has(key) && !downloadAbortRef.current.has(key)) {
        // eslint-disable-next-line no-await-in-loop
        await startDownload(t.url);
      }
    }
  }, [cachedUrls, startDownload]);

  const cancelAll = useCallback(() => {
    for (const ctrl of downloadAbortRef.current.values()) ctrl.abort();
  }, []);

  const clearAllCache = useCallback(async () => {
    if (!window.confirm("确认清空所有已下载的歌曲？")) return;
    // cancel in-flight
    for (const ctrl of downloadAbortRef.current.values()) ctrl.abort();
    downloadAbortRef.current.clear();
    await clearAudioCache();
    setCachedUrls(new Set());
    setDownloads({});
    refreshCache();
  }, [refreshCache]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      // Cmd/Ctrl+K or "/" to focus search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); return;
      }
      if (e.target.tagName === "INPUT") {
        if (e.key === "Escape") { setSearch(""); e.target.blur(); }
        return;
      }
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowRight" && e.metaKey) { e.preventDefault(); nextTrack(); }
      else if (e.code === "ArrowLeft" && e.metaKey) { e.preventDefault(); prevTrack(); }
      else if (e.code === "ArrowRight") { if (audioRef.current) audioRef.current.currentTime += 5; }
      else if (e.code === "ArrowLeft") { if (audioRef.current) audioRef.current.currentTime -= 5; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextTrack]);

  // edge-swipe gestures: open drawers from screen edges, close by swiping back
  useEffect(() => {
    let startX = 0, startY = 0, edge = null, tracking = false;
    const EDGE = 22;  // edge zone in px where a swipe-open can begin
    const TH = 56;    // distance to commit the gesture
    const onStart = (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (mobileDrawer === "albums") edge = "left-open";
      else if (mobileDrawer === "rail") edge = "right-open";
      else {
        const w = window.innerWidth;
        if (t.clientX <= EDGE) edge = "left";
        else if (t.clientX >= w - EDGE) edge = "right";
        else return;
      }
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };
    const onMove = (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      // bail if dominantly vertical (let scrolling win)
      if (Math.abs(dy) > Math.abs(dx) + 8 && Math.abs(dx) < 24) tracking = false;
    };
    const onEnd = (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      if (edge === "left" && dx > TH) setMobileDrawer("albums");
      else if (edge === "right" && dx < -TH) setMobileDrawer("rail");
      else if (edge === "left-open" && dx < -TH) setMobileDrawer(null);
      else if (edge === "right-open" && dx > TH) setMobileDrawer(null);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [mobileDrawer]);

  // search results — flat list of {albumIdx, trackIdx, track, album}
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const out = [];
    ALBUMS.forEach((a, ai) => {
      a.tracks.forEach((t, ti) => {
        const hay = (t.name + " " + a.name).toLowerCase();
        if (hay.includes(q)) out.push({ albumIdx: ai, trackIdx: ti, track: t, album: a });
      });
    });
    return out;
  }, [search]);

  const totalTracks = ALL_TRACKS.length;
  const totalAlbums = ALBUMS.length;

  // close drawer when track selected on mobile
  const selectAndClose = (ai, ti) => { selectTrack(ai, ti); setMobileDrawer(null); };

  return (
    <div className="app" data-drawer={mobileDrawer || "none"}>
      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar">
        <button className="mobile-btn" onClick={() => setMobileDrawer(mobileDrawer === "albums" ? null : "albums")} aria-label="唱片目录">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
        </button>
        <div className="mobile-title">
          <span className="mobile-title-cn">李志</span>
          <span className="mobile-title-en mono">LI·ZHI·ARCHIVE</span>
        </div>
        <button className="mobile-btn" onClick={() => setMobileDrawer(mobileDrawer === "rail" ? null : "rail")} aria-label="播放队列">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M4 6h12M4 12h12M4 18h8M18 15l3 3-3 3"/></svg>
        </button>
      </div>

      {/* mobile drawer backdrop */}
      {mobileDrawer && <div className="mobile-backdrop" onClick={() => setMobileDrawer(null)} />}

      {/* LEFT GUTTER */}
      <aside className="gutter">
        <div className="mast-cn">李志</div>
        <div className="mast-en">LI · ZHI · ARCHIVE</div>
        <div className="stamp">声 明</div>
        <div className="mast-no">NO.{String(selectedAlbumIdx+1).padStart(2,"0")}/{String(totalAlbums).padStart(2,"0")}</div>
      </aside>

      {/* ALBUM COLUMN */}
      <aside className="albums">
        <div className="albums-head">
          <div className="title">{searchResults ? "搜 索 结 果" : "唱 片 目 录"}</div>
          <div className="count mono">
            {searchResults ? `${searchResults.length} 首` : `${totalAlbums} 张 · ${totalTracks} 首`}
          </div>
        </div>
        {!searchResults && cacheSupported && (() => {
          const cachedN = ALL_TRACKS.filter(t => cachedUrls.has(normUrl(t.url))).length;
          const busy = Object.keys(downloads).length > 0;
          const allDone = cachedN === totalTracks;
          return (
            <button
              className={"all-dl-btn mono" + (allDone ? " done" : "") + (busy ? " busy" : "")}
              onClick={() => busy ? cancelAll() : downloadAll()}
              disabled={allDone}
              title={allDone ? "整个曲库都已离线" : (busy ? "点击取消所有进行中的下载" : "下载全部曲目到本地")}
            >
              {allDone
                ? <>已 全 部 离 线 · <span className="mono">{totalTracks}</span> 首</>
                : busy
                ? <>下 载 中 · <span className="mono">{cachedN} / {totalTracks}</span> · 点 击 取 消</>
                : <>一 键 下 载 全 部 · <span className="mono">{totalTracks - cachedN}</span> 首 剩 余</>}
            </button>
          );
        })()}
        <label className="search-box">
          <span className="search-ico"><I.search/></span>
          <input
            ref={searchRef}
            className="search-input"
            placeholder="歌 名 · 专 辑"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search ? (
            <button className="search-clear" onClick={() => { setSearch(""); searchRef.current?.focus(); }} title="清除">
              <I.x/>
            </button>
          ) : (
            <kbd className="search-kbd mono">/</kbd>
          )}
        </label>
        {searchResults ? (
          searchResults.length === 0 ? (
            <div className="search-empty">
              <div className="mono" style={{fontSize:10,letterSpacing:"0.2em",color:"var(--ink-3)",marginBottom:8}}>NO RESULTS</div>
              <div style={{fontSize:13,color:"var(--ink-2)"}}>没有找到「{search}」相关的歌曲。</div>
            </div>
          ) : (
            searchResults.map((r, i) => {
              const isCur = queueAlbumIdx === r.albumIdx && queueIdx === r.trackIdx;
              return (
                <div
                  key={i}
                  className={"search-row" + (isCur ? " playing" : "")}
                  onClick={() => { setSelectedAlbumIdx(r.albumIdx); selectAndClose(r.albumIdx, r.trackIdx); }}
                >
                  <div className="search-cover" style={{backgroundImage:`url(${r.album.cover})`}} />
                  <div style={{minWidth:0}}>
                    <div className="search-title">
                      <Highlight text={r.track.name} q={search} />
                    </div>
                    <div className="search-meta mono">
                      <Highlight text={r.album.name} q={search} /> · {r.album.year}
                    </div>
                  </div>
                  <div className="search-n mono">{String(r.trackIdx+1).padStart(2,"0")}</div>
                </div>
              );
            })
          )
        ) : (
          ALBUMS.map((a, i) => (
            <div
              key={a.name}
              className={"album-row" + (i === selectedAlbumIdx ? " selected" : "")}
              onClick={() => { setSelectedAlbumIdx(i); setMobileDrawer(null); }}
            >
              <div className="album-cover" style={{backgroundImage:`url(${a.cover})`}} />
              <div>
                <div className="album-name">{a.name}</div>
                <div className="album-meta mono">{a.year} · {a.tag || `${a.tracks.length} 曲`}</div>
              </div>
              <div className="album-n mono">{String(a.tracks.length).padStart(2,"0")}</div>
            </div>
          ))
        )}
      </aside>

      {/* STAGE */}
      <main className="stage">
        <header className="stage-head">
          <div className="album-art" style={{backgroundImage:`url(${album.cover})`}} />
          <div className="info">
            <div className="kicker">Album · 第 {romanize(selectedAlbumIdx+1)} 号</div>
            <h1>{album.name}</h1>
            <div className="sub">
              <span className="mono">{album.year}</span>
              <span className="dot">◆</span>
              <span className="tag">{album.tag || "ALBUM"}</span>
              <span className="dot">◆</span>
              <span className="mono">{album.tracks.length} TRACKS</span>
            </div>
            <div className="blurb">{ALBUM_BLURBS[album.name] || "李志的唱片。"}</div>
            {cacheSupported && (() => {
              const total = album.tracks.length;
              const cachedN = album.tracks.filter(t => cachedUrls.has(normUrl(t.url))).length;
              const dlN = album.tracks.filter(t => downloads[normUrl(t.url)] != null).length;
              const allDone = cachedN === total;
              return (
                <div className="album-actions">
                  <button
                    className={"album-dl-btn" + (allDone ? " done" : "") + (dlN ? " busy" : "")}
                    onClick={() => dlN ? cancelAlbum(album) : downloadAlbum(album)}
                    disabled={allDone}
                    title={allDone ? "已全部下载" : (dlN ? "点击取消" : "下载整张专辑到本地")}
                  >
                    {allDone ? <I.check size={14}/> : <I.cloud size={14}/>}
                    <span className="mono">
                      {allDone ? "已 下 载" : dlN ? `下 载 中 ${cachedN}/${total} · 点 击 取 消` : `下 载 专 辑 · ${total - cachedN} 首`}
                    </span>
                  </button>
                  <span className="album-dl-meta mono">{cachedN} / {total} 已 缓 存</span>
                </div>
              );
            })()}
          </div>
        </header>

        <div className="tracklist">
          <div className="tl-head">
            <div>№</div>
            <div>标 题</div>
            <div style={{textAlign:"left"}}>来源</div>
            <div style={{textAlign:"right"}}>时长</div>
            <div></div>
          </div>
          {album.tracks.map((t, i) => {
            const isCur = queueAlbumIdx === selectedAlbumIdx && queueIdx === i;
            const tKey = normUrl(t.url);
            const dlP = downloads[tKey];
            const isCached = cachedUrls.has(tKey);
            const isDl = dlP != null;
            return (
              <div
                key={i}
                className={"track" + (isCur ? " playing" : "")}
                onClick={() => selectTrack(selectedAlbumIdx, i)}
              >
                <div className="num mono">
                  {isCur && playing ? (
                    <span className="bars"><span/><span/><span/><span/></span>
                  ) : (
                    String(i+1).padStart(2,"0")
                  )}
                </div>
                <div className="name">{t.name}</div>
                <div className="src mono">{t.url.match(/\.(flac|mp3)$/i)?.[1]?.toUpperCase() || "MP3"}</div>
                <div className="dur mono">
                  {fmt(isCur && duration ? duration : durations[tKey])}
                </div>
                {cacheSupported ? (
                  <button
                    className={"track-cache-btn" + (isCached ? " cached" : "") + (isDl ? " busy" : "")}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDl) cancelDownload(t.url);
                      else if (isCached) removeDownload(t.url);
                      else startDownload(t.url);
                    }}
                    title={isCached ? "已下载 · 点击删除" : isDl ? "下载中 · 点击取消" : "下载到本地"}
                  >
                    {isDl ? (
                      <span className="cache-prog" style={{"--p": (dlP * 100).toFixed(0) + "%"}}>
                        <span className="cache-prog-n mono">{Math.floor(dlP * 100)}</span>
                      </span>
                    ) : isCached ? <I.check size={14}/> : <I.cloud size={14}/>}
                  </button>
                ) : (
                  <div className="play-icon"><I.play size={14}/></div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* RAIL */}
      <aside className="rail">
        <div className="rail-tabs">
          <button className={"rail-tab" + (rail==="queue"?" active":"")} onClick={()=>setRail("queue")}>播放队列</button>
          <button className={"rail-tab" + (rail==="notes"?" active":"")} onClick={()=>setRail("notes")}>档案</button>
          <button className={"rail-tab" + (rail==="poem"?" active":"")} onClick={()=>setRail("poem")}>题记</button>
        </div>
        <div className="rail-body">
          {rail === "queue" && (
            <div>
              <div style={{fontFamily:"JetBrains Mono, monospace",fontSize:10,letterSpacing:"0.2em",color:"var(--ink-3)",textTransform:"uppercase",marginBottom:10}}>
                正在播放 · {queueAlbum.name}
              </div>
              {queueAlbum.tracks.map((t, i) => (
                <div
                  key={i}
                  className={"queue-item" + (i === queueIdx ? " current" : "")}
                  onClick={() => selectAndClose(queueAlbumIdx, i)}
                >
                  <span className="qn mono">{String(i+1).padStart(2,"0")}</span>
                  <span className="qt">{t.name}</span>
                  <span className="qm mono">{i === queueIdx ? (playing ? "▶" : "‖") : ""}</span>
                </div>
              ))}
            </div>
          )}
          {rail === "notes" && (
            <div className="notes">
              <h3>关 于 李 志</h3>
              <p>南京民谣歌手，独立音乐人。本档案整理其公开发行的录音室专辑与现场录音，仅作收藏与欣赏之用。</p>
              <h3>本 专 辑</h3>
              <p>{ALBUM_BLURBS[album.name] || "李志的唱片。"}</p>
              <div className="stat-grid">
                <div className="stat"><div className="k mono">年份</div><div className="v mono">{album.year}</div></div>
                <div className="stat"><div className="k mono">曲目</div><div className="v mono">{album.tracks.length}</div></div>
              </div>
              <h3>档 案 总 览</h3>
              <div className="stat-grid">
                <div className="stat"><div className="k mono">专辑</div><div className="v mono">{totalAlbums}</div></div>
                <div className="stat"><div className="k mono">单曲</div><div className="v mono">{totalTracks}</div></div>
              </div>
              {cacheSupported && (
                <>
                  <h3>离 线 缓 存</h3>
                  <div className="stat-grid">
                    <div className="stat">
                      <div className="k mono">已 缓 存</div>
                      <div className="v mono">{cachedUrls.size}</div>
                    </div>
                    <div className="stat">
                      <div className="k mono">已 用</div>
                      <div className="v mono" style={{fontSize:14}}>{fmtBytes(storage.usage)}</div>
                    </div>
                  </div>
                  {storage.quota > 0 && (
                    <div className="quota-bar" title={`${fmtBytes(storage.usage)} / ${fmtBytes(storage.quota)}`}>
                      <div className="quota-fill" style={{width: Math.min(100, (storage.usage / storage.quota) * 100) + "%"}} />
                    </div>
                  )}
                  <p style={{fontSize:11,color:"var(--ink-3)",lineHeight:1.6,marginTop:6}}>
                    点 击 曲 目 右 侧 的 云 图 标 单 独 下 载，或 在 专 辑 页 一 键 下 载 整 张。已 缓 存 的 曲 目 可 离 线 播 放。
                  </p>
                  <button
                    className="cache-clear-btn mono"
                    onClick={clearAllCache}
                    disabled={cachedUrls.size === 0}
                  >
                    <I.trash size={12}/> <span>全 部 清 空</span>
                  </button>
                </>
              )}
              <h3>键 盘</h3>
              <p style={{fontFamily:"JetBrains Mono, monospace",fontSize:11,lineHeight:1.8}}>
                Space — 播放 / 暂停<br/>
                ← → — 后退 / 前进 5s<br/>
                ⌘ + ← → — 上一首 / 下一首
              </p>
              <div className="version-line mono">
                <span>BUILD</span>
                <span className="version-tag">{appVersion || "—"}</span>
              </div>
            </div>
          )}
          {rail === "poem" && (
            <div className="poem vert">
              <span className="line strong">我没有必要去讨好谁</span>
              <span className="line">也没有义务解释我自己</span>
              <span className="line">黑暗里我睁开眼睛</span>
              <span className="line">看见南方城市的夏天</span>
              <span className="line">一直到很晚很晚</span>
              <span className="line strong">我还在听你的歌</span>
            </div>
          )}
        </div>
      </aside>

      {/* TRANSPORT */}
      <footer className="transport">
        <div className={"loading-stripe" + (loading ? " active" : "")}></div>

        <div className="t-now">
          <div className={"mini-art" + (playing ? " spinning" : "")} style={{backgroundImage:`url(${track?.cover})`}} />
          <div style={{minWidth:0,flex:1}}>
            <div className="t-title">{track?.name || "—"}</div>
            <div className="t-album mono">{queueAlbum.name} · {queueAlbum.year}</div>
          </div>
        </div>

        <div className="t-center">
          <div className="t-buttons">
            <button className={"t-btn" + (shuffle?" active":"")} onClick={()=>setShuffle(!shuffle)} title="随机"><I.shuffle/></button>
            <button className="t-btn" onClick={prevTrack} title="上一首"><I.prev/></button>
            <button className="t-btn play" onClick={togglePlay} title={playing?"暂停":"播放"}>
              {playing ? <I.pause size={20}/> : <I.play size={20}/>}
            </button>
            <button className="t-btn" onClick={nextTrack} title="下一首"><I.next/></button>
            <button
              className={"t-btn" + (repeat!=="off"?" active":"")}
              onClick={()=>setRepeat(r => r==="off"?"all":r==="all"?"one":"off")}
              title={repeat==="one"?"单曲循环":repeat==="all"?"列表循环":"不循环"}
            >
              <I.repeat/>
              {repeat==="one" && <span style={{position:"absolute",fontSize:8,marginLeft:-8,marginTop:-2,fontFamily:"monospace"}}>1</span>}
            </button>
          </div>
          <div className="t-progress">
            <span style={{width:44,textAlign:"right"}}>{fmt(current)}</span>
            <div className="t-bar" onClick={seek}>
              <div className="buf" style={{width: (buffered/(duration||1))*100 + "%"}} />
              <div className="fill" style={{width: (current/(duration||1))*100 + "%"}} />
              <div className="knob" style={{left: (current/(duration||1))*100 + "%"}} />
            </div>
            <span style={{width:44}}>{fmt(duration)}</span>
          </div>
        </div>

        <div className="t-right">
          <div className="t-vol">
            <button className="t-btn" onClick={()=>setMuted(!muted)} style={{padding:0}}>
              {muted || volume===0 ? <I.mute/> : <I.vol/>}
            </button>
            <div className="vbar" onClick={setVol}>
              <div className="vfill" style={{width: (muted?0:volume)*100 + "%"}} />
            </div>
          </div>
          <button
            className={"t-btn" + (focus?" active":"")}
            onClick={()=>setFocus(!focus)}
            title="专注模式"
            style={{fontFamily:"JetBrains Mono, monospace",fontSize:10,letterSpacing:"0.15em",padding:"6px 10px",border:"1px solid rgba(242,237,228,0.3)"}}
          >
            {focus ? "退 出" : "专 注"}
          </button>
        </div>
      </footer>

      {error && <div className="toast">{error}</div>}

      {updateReady && (
        <div className="update-banner" role="status">
          <div className="ub-stamp mono">NEW</div>
          <div className="ub-body">
            <div className="ub-title">新 版 本 已 就 绪</div>
            <div className="ub-sub mono">UPDATE READY · 刷 新 以 应 用</div>
          </div>
          <button className="ub-cta mono" onClick={applyUpdate}>刷 新</button>
          <button className="ub-x" onClick={() => setUpdateReady(false)} title="稍后"><I.x/></button>
        </div>
      )}

      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onMeta}
        onEnded={onEnded}
        onWaiting={onWait}
        onCanPlay={onCanPlay}
        onError={onErr}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
