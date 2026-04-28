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
  x: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:14,height:14}}><path d="M6 6l12 12M18 6L6 18"/></svg>
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
  const onMeta = (e) => { setDuration(e.target.duration); setLoading(false); };
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
                  {isCur && duration ? fmt(duration) : "—:—"}
                </div>
                <div className="play-icon"><I.play size={14}/></div>
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
              <h3>键 盘</h3>
              <p style={{fontFamily:"JetBrains Mono, monospace",fontSize:11,lineHeight:1.8}}>
                Space — 播放 / 暂停<br/>
                ← → — 后退 / 前进 5s<br/>
                ⌘ + ← → — 上一首 / 下一首
              </p>
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
