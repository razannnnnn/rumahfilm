"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

function parseVtt(vttText) {
  const cues = [];
  const blocks = vttText.trim().split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;
    let i = 0;
    if (lines[0].includes("WEBVTT") || /^\d+$/.test(lines[0].trim())) i = 1;
    const timeLine = lines[i];
    if (!timeLine || !timeLine.includes("-->")) continue;
    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());
    const toSeconds = (t) => {
      const parts = t.replace(",", ".").split(":");
      if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    };
    const text = lines.slice(i + 1).join("\n").replace(/<[^>]+>/g, "");
    if (text.trim()) cues.push({ start: toSeconds(startStr), end: toSeconds(endStr), text });
  }
  return cues;
}

export default function VideoPlayer({ filmId, title }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);
  const tapTimer = useRef(null);
  const tapCount = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [skipIndicator, setSkipIndicator] = useState(null);
  const [volumeIndicator, setVolumeIndicator] = useState(null);
  const volumeTimer = useRef(null);

  const [subtitleCues, setSubtitleCues] = useState([]);
  const [currentCue, setCurrentCue] = useState(null);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [subtitleAvailable, setSubtitleAvailable] = useState(false);

  const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  const streamUrl = `${stbUrl}/api/stream/${filmId}`;

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const loadSubtitle = async () => {
      try {
        const res = await fetch(`${stbUrl}/api/subtitle/${filmId}`);
        if (!res.ok) return;
        const text = await res.text();
        const cues = parseVtt(text);
        setSubtitleCues(cues);
        setSubtitleAvailable(cues.length > 0);
      } catch {
        setSubtitleAvailable(false);
      }
    };
    loadSubtitle();
  }, [filmId]);

  useEffect(() => {
    if (!subtitleEnabled || subtitleCues.length === 0) { setCurrentCue(null); return; }
    const cue = subtitleCues.find((c) => currentTime >= c.start && currentTime <= c.end);
    setCurrentCue(cue || null);
  }, [currentTime, subtitleCues, subtitleEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (!videoRef.current) return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      if (e.key === "ArrowRight") { skip(10); showSkipIndicator("right"); }
      if (e.key === "ArrowLeft") { skip(-10); showSkipIndicator("left"); }
      if (e.key === "ArrowUp") {
        const newVol = Math.min(1, volume + 0.1);
        setVolume(newVol);
        if (videoRef.current) videoRef.current.volume = newVol;
        showVolumePopup(newVol);
      }
      if (e.key === "ArrowDown") {
        const newVol = Math.max(0, volume - 0.1);
        setVolume(newVol);
        if (videoRef.current) videoRef.current.volume = newVol;
        showVolumePopup(newVol);
      }
      if (e.key === "f") toggleFullscreen();
      if (e.key === "m") toggleMute();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [volume, playing]);

  const showSkipIndicator = (side) => {
    setSkipIndicator(side);
    setTimeout(() => setSkipIndicator(null), 700);
  };

  const showVolumePopup = (val) => {
    setVolumeIndicator(Math.round(val * 100));
    clearTimeout(volumeTimer.current);
    volumeTimer.current = setTimeout(() => setVolumeIndicator(null), 1500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
  };

  const skip = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || seeking) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100 || 0);
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / dur) * 100 || 0);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = (val / 100) * videoRef.current.duration;
    setProgress(val);
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0; }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    setMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  // Handle tap — double tap skip, single tap toggle controls
  const handleVideoTap = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const isLeft = x < rect.width * 0.35;
    const isRight = x > rect.width * 0.65;
    const isCenter = !isLeft && !isRight;

    tapCount.current += 1;

    if (tapTimer.current) clearTimeout(tapTimer.current);

    tapTimer.current = setTimeout(() => {
      if (tapCount.current === 1) {
        // Single tap — toggle controls saja
        if (isCenter) {
          resetHideTimer();
        } else {
          resetHideTimer();
        }
      } else if (tapCount.current >= 2) {
        // Double tap — skip
        if (isLeft) { skip(-10); showSkipIndicator("left"); }
        else if (isRight) { skip(10); showSkipIndicator("right"); }
        else { togglePlay(); }
      }
      tapCount.current = 0;
    }, 250);
  };

  // Tap center untuk play/pause (via controls button saja di mobile)
  const handleCenterPlay = (e) => {
    e.stopPropagation();
    togglePlay();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none"
      style={{ aspectRatio: "16/9", borderRadius: isFullscreen ? "0" : "12px", overflow: "hidden" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={handleVideoTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full"
        style={{ display: "block" }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Double tap skip indicator kiri */}
      <AnimatePresence>
        {skipIndicator === "left" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 flex items-center justify-center pointer-events-none"
            style={{ width: "35%", background: "rgba(255,255,255,0.08)", borderRadius: "0 999px 999px 0" }}
          >
            <div className="flex flex-col items-center gap-1 text-white">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
              </svg>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>-10 detik</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double tap skip indicator kanan */}
      <AnimatePresence>
        {skipIndicator === "right" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none"
            style={{ width: "35%", background: "rgba(255,255,255,0.08)", borderRadius: "999px 0 0 999px" }}
          >
            <div className="flex flex-col items-center gap-1 text-white">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
              </svg>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>+10 detik</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitle */}
      <AnimatePresence>
        {currentCue && subtitleEnabled && (
          <motion.div
            key={currentCue.text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 flex justify-center pointer-events-none"
            style={{ bottom: showControls ? "80px" : "24px", transition: "bottom 0.3s", padding: "0 8%" }}
          >
            <div
              className="text-center text-white"
              style={{
                fontSize: "18px",
                fontWeight: "400",
                lineHeight: "1.6",
                textShadow: "2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0 2px 8px rgba(0,0,0,1)",
                whiteSpace: "pre-line",
                letterSpacing: "0.01em",
              }}
            >
              {currentCue.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volume indicator */}
      <AnimatePresence>
        {volumeIndicator !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10"
              style={{ padding: "20px 28px", minWidth: "100px" }}
            >
              <div className="text-white">
                {volumeIndicator === 0 ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                  </svg>
                ) : volumeIndicator < 50 ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                  </svg>
                )}
              </div>
              <div className="w-full rounded-full overflow-hidden" style={{ height: "4px", background: "rgba(255,255,255,0.15)" }}>
                <motion.div
                  className="h-full rounded-full bg-[#86efac]"
                  initial={false}
                  animate={{ width: `${volumeIndicator}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-white font-semibold tabular-nums" style={{ fontSize: "20px" }}>
                {volumeIndicator}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center play icon — hanya saat pause, klik ini toggle play */}
      <AnimatePresence>
        {!playing && showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <div
              onClick={handleCenterPlay}
              className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20"
              style={{ pointerEvents: "auto", cursor: "pointer" }}
            >
              <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between pointer-events-none"
          >
            {/* Top */}
            <div
              className="bg-gradient-to-b from-black/70 to-transparent px-4 pt-3 pb-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-white/90 text-sm font-medium truncate">{title}</span>
            </div>

            {/* Bottom controls */}
            <div
              className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div
                className="relative w-full mb-3"
                style={{ height: "20px", display: "flex", alignItems: "center" }}
              >
                <div
                  className="absolute w-full rounded-full overflow-hidden"
                  style={{ height: "3px", background: "rgba(255,255,255,0.15)" }}
                >
                  <div className="absolute h-full rounded-full" style={{ width: `${buffered}%`, background: "rgba(255,255,255,0.25)", transition: "width 0.3s" }} />
                  <div className="absolute h-full rounded-full" style={{ width: `${progress}%`, background: "#86efac", transition: seeking ? "none" : "width 0.1s" }} />
                </div>
                <input
                  type="range" min={0} max={100} step={0.1} value={progress}
                  onChange={handleSeek}
                  onMouseDown={() => setSeeking(true)}
                  onMouseUp={() => setSeeking(false)}
                  onTouchStart={() => setSeeking(true)}
                  onTouchEnd={() => setSeeking(false)}
                  className="absolute w-full opacity-0 cursor-pointer"
                  style={{ height: "20px" }}
                />
                <div
                  className="absolute rounded-full bg-white pointer-events-none"
                  style={{ width: "14px", height: "14px", left: `calc(${progress}% - 7px)`, transition: seeking ? "none" : "left 0.1s", boxShadow: "0 0 6px rgba(134,239,172,0.6)" }}
                />
              </div>

              {/* Buttons row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: "16px" }}>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="text-white"
                    style={{ padding: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }}
                  >
                    {playing ? (
                      <svg style={{ width: "22px", height: "22px" }} fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg style={{ width: "22px", height: "22px" }} fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Skip -10 */}
                  <button onClick={() => { skip(-10); showSkipIndicator("left"); }} className="text-white/80 flex flex-col items-center" style={{ gap: "1px" }}>
                    <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                    </svg>
                    <span style={{ fontSize: "9px", opacity: 0.7, lineHeight: 1 }}>10</span>
                  </button>

                  {/* Skip +10 */}
                  <button onClick={() => { skip(10); showSkipIndicator("right"); }} className="text-white/80 flex flex-col items-center" style={{ gap: "1px" }}>
                    <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
                    </svg>
                    <span style={{ fontSize: "9px", opacity: 0.7, lineHeight: 1 }}>10</span>
                  </button>

                  {/* Volume — sembunyikan di mobile, tetap ada di desktop */}
                  <button onClick={toggleMute} className="text-white/80 hidden md:block">
                    {muted || volume === 0 ? (
                      <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                      </svg>
                    ) : (
                      <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                      </svg>
                    )}
                  </button>

                  {/* Time */}
                  <span className="text-white/70 font-mono tabular-nums" style={{ fontSize: "11px" }}>
                    {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center" style={{ gap: "10px" }}>
                  {/* CC */}
                  {subtitleAvailable && (
                    <button
                      onClick={() => setSubtitleEnabled(!subtitleEnabled)}
                      style={{
                        fontSize: "11px", fontWeight: 600,
                        padding: "4px 8px", borderRadius: "6px",
                        border: subtitleEnabled ? "1px solid rgba(134,239,172,0.4)" : "1px solid rgba(255,255,255,0.2)",
                        background: subtitleEnabled ? "rgba(134,239,172,0.1)" : "transparent",
                        color: subtitleEnabled ? "#86efac" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      CC
                    </button>
                  )}

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="text-white/80">
                    {isFullscreen ? (
                      <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    ) : (
                      <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}