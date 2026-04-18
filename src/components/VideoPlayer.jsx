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
      if (parts.length === 3) {
        return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
      }
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    };
    const text = lines
      .slice(i + 1)
      .join("\n")
      .replace(/<[^>]+>/g, "");
    if (text.trim()) {
      cues.push({ start: toSeconds(startStr), end: toSeconds(endStr), text });
    }
  }
  return cues;
}

export default function VideoPlayer({ filmId, title }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const [showShortcutInfo, setShowShortcutInfo] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [showBrightnessSlider, setShowBrightnessSlider] = useState(false);

  const [skipIndicator, setSkipIndicator] = useState(null); // 'forward' | 'backward'
  const [volumeIndicator, setVolumeIndicator] = useState(null); // { level: 0-100 }
  const volumeIndicatorTimer = useRef(null);

  const [showResumeToast, setShowResumeToast] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const saveProgressTimer = useRef(null);

  // Subtitle states
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

  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const showVolumeIndicator = (level) => {
  setVolumeIndicator({ level: Math.round(level * 100) });
  clearTimeout(volumeIndicatorTimer.current);
  volumeIndicatorTimer.current = setTimeout(() => setVolumeIndicator(null), 1500);
};

  // Keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e) => {
    // Jangan aktif kalau user sedang ketik di input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowLeft":
        e.preventDefault();
        skip(-10);
        break;
      case "ArrowRight":
        e.preventDefault();
        skip(10);
        break;
      case "ArrowUp":
  e.preventDefault();
  if (videoRef.current) {
    const newVol = Math.min(1, volume + 0.1);
    setVolume(newVol);
    setMuted(false);
    videoRef.current.volume = newVol;
    videoRef.current.muted = false;
    showVolumeIndicator(newVol); // ← tambahkan ini
  }
  break;
case "ArrowDown":
  e.preventDefault();
  if (videoRef.current) {
    const newVol = Math.max(0, volume - 0.1);
    setVolume(newVol);
    setMuted(newVol === 0);
    videoRef.current.volume = newVol;
    videoRef.current.muted = newVol === 0;
    showVolumeIndicator(newVol); // ← tambahkan ini
  }
  break;
      case "f":
      case "F":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "m":
      case "M":
        e.preventDefault();
        toggleMute();
        break;
      case "c":
      case "C":
        e.preventDefault();
        if (subtitleAvailable) setSubtitleEnabled((prev) => !prev);
        break;
      default:
        break;
      case "?":
        setShowShortcutInfo((prev) => !prev);
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [playing, volume, muted, subtitleAvailable, subtitleEnabled]);

  // Load & parse subtitle
  useEffect(() => {
    const loadSubtitle = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_STB_URL}/api/subtitle/${filmId}`);
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

  // Update current cue berdasarkan waktu video
  useEffect(() => {
    if (!subtitleEnabled || subtitleCues.length === 0) {
      setCurrentCue(null);
      return;
    }
    const cue = subtitleCues.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    setCurrentCue(cue || null);
  }, [currentTime, subtitleCues, subtitleEnabled]);

  // Load progress dari localStorage
useEffect(() => {
  const saved = localStorage.getItem(`progress:${filmId}`);
  if (saved) {
    const { time, duration: savedDuration } = JSON.parse(saved);
    // Hanya resume jika belum hampir selesai (< 95%)
    if (savedDuration && time / savedDuration < 0.95 && time > 10) {
      setResumeTime(time);
      setShowResumeToast(true);
    }
  }
}, [filmId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
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

  // Simpan progress setiap 5 detik
  clearTimeout(saveProgressTimer.current);
  saveProgressTimer.current = setTimeout(() => {
    if (dur && cur > 10) {
      localStorage.setItem(`progress:${filmId}`, JSON.stringify({ time: cur, duration: dur }));
    }
    // Hapus progress jika sudah hampir selesai
    if (dur && cur / dur > 0.95) {
      localStorage.removeItem(`progress:${filmId}`);
    }
  }, 5000);
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
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !muted;
    setMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skip = (seconds) => {
  if (!videoRef.current) return;
  videoRef.current.currentTime = Math.max(
    0,
    Math.min(videoRef.current.currentTime + seconds, duration)
  );
  setSkipIndicator(seconds > 0 ? "forward" : "backward");
  setTimeout(() => setSkipIndicator(null), 600);
};

  const handleResume = () => {
  if (videoRef.current) {
    videoRef.current.currentTime = resumeTime;
    videoRef.current.play();
  }
  setShowResumeToast(false);
};

const dismissResume = () => {
  setShowResumeToast(false);
};

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none"
      style={{
        aspectRatio: "16/9",
        borderRadius: isFullscreen ? "0" : "12px",
        overflow: "hidden",
      }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video */}
      <video
  ref={videoRef}
  src={streamUrl}
  className="w-full h-full"
  style={{ display: "block", filter: `brightness(${brightness}%)` }}
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
  onPlay={() => setPlaying(true)}
  onPause={() => setPlaying(false)}
  onClick={togglePlay}
/>
      {/* Skip indicator */}
<AnimatePresence>
  {skipIndicator && (
    <>
      {skipIndicator === "backward" && (
        <motion.div
          key="backward"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">-10 detik</span>
        </motion.div>
      )}
      {skipIndicator === "forward" && (
        <motion.div
          key="forward"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
            </svg>
          </div>
          <span className="text-white text-xs font-medium">+10 detik</span>
        </motion.div>
      )}
    </>
  )}
</AnimatePresence>

{/* Volume indicator */}
<AnimatePresence>
  {volumeIndicator !== null && (
    <motion.div
      key="volume-indicator"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-50"
      style={{
        top: "24px",
        left: "50%",
        translateX: "-50%",
      }}
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
        <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          {volumeIndicator.level === 0 ? (
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
          ) : volumeIndicator.level < 50 ? (
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
          ) : (
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
          )}
        </svg>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: "4px",
                height: `${8 + i * 2}px`,
                background: (i + 1) * 10 <= volumeIndicator.level ? "#86efac" : "rgba(255,255,255,0.25)",
                transition: "background 0.1s",
              }}
            />
          ))}
        </div>
        <span className="text-white text-sm font-medium tabular-nums w-8 text-right">
          {volumeIndicator.level}%
        </span>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Resume toast */}
<AnimatePresence>
  {showResumeToast && (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
className="absolute top-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-black/70 backdrop-blur-md text-sm text-white shadow-xl"    >
      <svg className="w-4 h-4 text-[#86efac] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
      </svg>
      <span className="text-white/80 text-xs">
        Lanjut dari <span className="text-white font-medium">{formatTime(resumeTime)}</span>
      </span>
      <button
        onClick={handleResume}
        className="text-xs font-medium text-[#86efac] hover:text-white border border-[#86efac]/40 hover:border-white/30 px-2.5 py-1 rounded-lg transition-colors"
      >
        Lanjut
      </button>
      <button
        onClick={dismissResume}
        className="text-white/40 hover:text-white/70 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )}
</AnimatePresence>

{/* Shortcut info popup */}
<AnimatePresence>
  {showShortcutInfo && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 pointer-events-auto"
        style={{ minWidth: "280px" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-sm font-semibold">Keyboard Shortcut</h3>
          <button
            onClick={() => setShowShortcutInfo(false)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            { key: "Space / K", desc: "Play / Pause" },
            { key: "←", desc: "Mundur 10 detik" },
            { key: "→", desc: "Maju 10 detik" },
            { key: "↑", desc: "Volume naik" },
            { key: "↓", desc: "Volume turun" },
            { key: "F", desc: "Fullscreen" },
            { key: "M", desc: "Mute / Unmute" },
            { key: "C", desc: "Toggle subtitle" },
            { key: "?", desc: "Tampilkan shortcut" },
          ].map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between gap-8">
              <span className="text-white/50 text-xs">{desc}</span>
              <kbd className="text-xs text-[#86efac] border border-[#86efac]/30 bg-[#86efac]/10 px-2 py-0.5 rounded font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Custom Subtitle Renderer */}
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
          fontSize: "22px",
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

      {/* Center play icon */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20">
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
            <div className="bg-gradient-to-b from-black/70 to-transparent px-5 pt-4 pb-8 pointer-events-auto">
              <span className="text-white/90 text-sm font-medium truncate">{title}</span>
            </div>

            {/* Bottom controls */}
            <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-4 pt-10 pointer-events-auto">

              {/* Progress bar */}
              <div
                className="relative w-full mb-3"
                style={{ height: "20px", display: "flex", alignItems: "center" }}
              >
                <div
                  className="absolute w-full rounded-full overflow-hidden"
                  style={{ height: "3px", background: "rgba(255,255,255,0.15)" }}
                >
                  <div
                    className="absolute h-full rounded-full"
                    style={{
                      width: `${buffered}%`,
                      background: "rgba(255,255,255,0.25)",
                      transition: "width 0.3s",
                    }}
                  />
                  <div
                    className="absolute h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: "#86efac",
                      transition: seeking ? "none" : "width 0.1s",
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.1}
                  value={progress}
                  onChange={handleSeek}
                  onMouseDown={() => setSeeking(true)}
                  onMouseUp={() => setSeeking(false)}
                  className="absolute w-full opacity-0 cursor-pointer"
                  style={{ height: "20px" }}
                />
                <div
                  className="absolute rounded-full bg-white pointer-events-none"
                  style={{
                    width: "12px",
                    height: "12px",
                    left: `calc(${progress}% - 6px)`,
                    transition: seeking ? "none" : "left 0.1s",
                    boxShadow: "0 0 6px rgba(134,239,172,0.6)",
                  }}
                />
              </div>

              {/* Buttons row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">

                  {/* Play/Pause */}
                  <button onClick={togglePlay} className="text-white hover:text-[#86efac] transition-colors">
                    {playing ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Skip -10s */}
                  <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors flex flex-col items-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                    </svg>
                    <span style={{ fontSize: "9px", marginTop: "-1px", opacity: 0.7 }}>10</span>
                  </button>

                  {/* Skip +10s */}
                  <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors flex flex-col items-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
                    </svg>
                    <span style={{ fontSize: "9px", marginTop: "-1px", opacity: 0.7 }}>10</span>
                  </button>

                  {/* Volume */}
                  <div
                    className="relative flex items-center gap-2"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
                      {muted || volume === 0 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                        </svg>
                      ) : volume < 0.5 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                        </svg>
                      )}
                    </button>
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "80px" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={muted ? 0 : volume}
                            onChange={handleVolume}
                            className="w-full accent-[#86efac]"
                            style={{ height: "4px" }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Time */}
                  <span className="text-white/70 text-xs font-mono tabular-nums">
                    {formatTime(currentTime)}{" "}
                    <span className="text-white/30">/</span>{" "}
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls */}
                
                <div className="flex items-center gap-3">
                  {/* Brightness */}
<div
  className="relative flex items-center"
  onMouseEnter={() => setShowBrightnessSlider(true)}
  onMouseLeave={() => setShowBrightnessSlider(false)}
>
  <button className="text-white/80 hover:text-white transition-colors">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  </button>
  <AnimatePresence>
    {showBrightnessSlider && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-8 right-0 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2"
        style={{ width: "40px" }}
      >
        <span className="text-white/60 text-[10px]">{brightness}%</span>
        <input
          type="range"
          min={30}
          max={200}
          step={5}
          value={brightness}
          onChange={(e) => setBrightness(parseInt(e.target.value))}
          className="accent-[#86efac]"
          style={{
            writingMode: "vertical-lr",
            direction: "rtl",
            height: "80px",
            width: "4px",
          }}
        />
        <button
          onClick={() => setBrightness(100)}
          className="text-[10px] text-white/40 hover:text-white transition-colors"
        >
          Reset
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>
                  {/* CC toggle */}
                  {subtitleAvailable && (
                    <button
                      onClick={() => setSubtitleEnabled(!subtitleEnabled)}
                      className={`text-xs font-semibold px-2 py-1 rounded border transition-colors ${
                        subtitleEnabled
                          ? "text-[#86efac] border-[#86efac]/40 bg-[#86efac]/10"
                          : "text-white/40 border-white/20 bg-transparent"
                      }`}
                    >
                      CC
                    </button>
                  )}
                  {/* Shortcut info */}
<button
  onClick={() => setShowShortcutInfo((prev) => !prev)}
  className="text-white/80 hover:text-white transition-colors text-xs font-semibold w-5 h-5 rounded-full border border-white/30 flex items-center justify-center"
>
  ?
</button>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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