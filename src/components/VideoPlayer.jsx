"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { saveHistory, getFilmProgress } from "@/lib/history";
import { useSearchParams } from "next/navigation";

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

export default function VideoPlayer({ filmId, title, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);
  const tapTimer = useRef(null);
  const tapCount = useRef(0);
  const saveTimer = useRef(null);
  const volumeTimer = useRef(null);
  const brightnessTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [skipIndicator, setSkipIndicator] = useState(null);
  const [volumeIndicator, setVolumeIndicator] = useState(null);
  const [brightnessIndicator, setBrightnessIndicator] = useState(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showBrightnessSlider, setShowBrightnessSlider] = useState(false);

  const [subtitleCues, setSubtitleCues] = useState([]);
  const [currentCue, setCurrentCue] = useState(null);
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [subtitleAvailable, setSubtitleAvailable] = useState(false);

  // Server-side duration fallback (via ffprobe) for transcoded streams
  const fetchedDuration = useRef(null);

  const [streamUrl, setStreamUrl] = useState(`/api/stream/${filmId}`);
  const [offsetTime, setOffsetTime] = useState(0);

  const searchParams = useSearchParams();
  const startTime = parseInt(searchParams.get("t") || "0");

  const formatTime = (s) => {
    if (!s || isNaN(s) || !isFinite(s)) return "0:00";
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

  // Fetch real duration from server (ffprobe) as fallback for transcoded streams
  useEffect(() => {
    const fetchDuration = async () => {
      try {
        const res = await fetch(`/api/duration/${filmId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.duration && data.duration > 0) {
          fetchedDuration.current = data.duration;
          // If browser still doesn't know the duration, use the fetched one
          if (!duration || !isFinite(duration) || duration <= 0) {
            setDuration(data.duration);
          }
        }
      } catch {
        // ignore — browser duration will be used
      }
    };
    fetchDuration();
  }, [filmId]);

  useEffect(() => {
    const loadSubtitle = async () => {
      try {
        const res = await fetch(`/api/subtitle/${filmId}`);
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

  // Keyboard shortcuts — use refs to avoid stale closures
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const subtitleEnabledRef = useRef(subtitleEnabled);
  subtitleEnabledRef.current = subtitleEnabled;

  useEffect(() => {
    const handleKey = (e) => {
      if (!videoRef.current) return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); togglePlay(); }
      if (e.key === "ArrowRight") { skip(10); showSkipIndicator("right"); }
      if (e.key === "ArrowLeft") { skip(-10); showSkipIndicator("left"); }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const el = videoRef.current;
        const newVol = Math.min(1, el.volume + 0.1);
        el.volume = newVol;
        el.muted = false;
        setVolume(newVol);
        setMuted(false);
        showVolumePopup(newVol);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const el = videoRef.current;
        const newVol = Math.max(0, el.volume - 0.1);
        el.volume = newVol;
        setVolume(newVol);
        if (newVol === 0) setMuted(true);
        showVolumePopup(newVol);
      }
      if (e.key === "f") toggleFullscreen();
      if (e.key === "m") toggleMute();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // Only mount/unmount once — refs keep values fresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSkipIndicator = (side) => {
    setSkipIndicator(side);
    setTimeout(() => setSkipIndicator(null), 700);
  };

  const showVolumePopup = (val) => {
    setVolumeIndicator(Math.round(val * 100));
    clearTimeout(volumeTimer.current);
    volumeTimer.current = setTimeout(() => setVolumeIndicator(null), 1500);
  };

  const showBrightnessPopup = (val) => {
    setBrightnessIndicator(Math.round(val * 100));
    clearTimeout(brightnessTimer.current);
    brightnessTimer.current = setTimeout(() => setBrightnessIndicator(null), 1500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    playingRef.current ? videoRef.current.pause() : videoRef.current.play();
  };

  // Use the effective duration state for calculations instead of the raw video element duration
  const skip = (seconds) => {
    if (!videoRef.current) return;
    const effectiveDur = duration > 0 ? duration : videoRef.current.duration;
    const targetTime = Math.max(0, Math.min(effectiveDur, currentTime + seconds));
    
    const browserDur = videoRef.current.duration;
    const isTranscoded = !isFinite(browserDur) || (fetchedDuration.current && browserDur < fetchedDuration.current * 0.9);
    
    if (isTranscoded) {
      setOffsetTime(targetTime);
      setStreamUrl(`/api/stream/${filmId}?start=${targetTime}`);
      setPlaying(true);
    } else {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || seeking) return;
    const cur = videoRef.current.currentTime;
    const realCur = cur + offsetTime;
    const browserDur = videoRef.current.duration;
    setCurrentTime(realCur);

    // Always prefer server-fetched duration (ffprobe) — browser duration is
    // unreliable for transcoded FFmpeg streams (reports fragment size, not total)
    const serverDur = fetchedDuration.current;
    const validBrowserDur = browserDur && isFinite(browserDur) && browserDur > 0;
    const effectiveDur = serverDur && serverDur > 0 ? serverDur : (validBrowserDur ? browserDur : null);

    if (effectiveDur && effectiveDur > 0) {
      setDuration(effectiveDur);
      setProgress((realCur / effectiveDur) * 100 || 0);
    }

    if (videoRef.current.buffered.length > 0 && effectiveDur && effectiveDur > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / effectiveDur) * 100 || 0);
    }

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (cur > 5) {
        saveHistory({ id: filmId, title, currentTime: cur, poster });
      }
    }, 10000);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    
    // Always use the validated duration state (which includes server fallback)
    const effectiveDur = duration > 0 ? duration : videoRef.current.duration;
    
    if (effectiveDur && isFinite(effectiveDur)) {
      const targetTime = (val / 100) * effectiveDur;
      
      // Detect if stream is transcoded (browser doesn't know full duration)
      const browserDur = videoRef.current.duration;
      const isTranscoded = !isFinite(browserDur) || (fetchedDuration.current && browserDur < fetchedDuration.current * 0.9);
      
      if (isTranscoded) {
        setOffsetTime(targetTime);
        setStreamUrl(`/api/stream/${filmId}?start=${targetTime}`);
        setPlaying(true); // Auto-play after seek
      } else {
        videoRef.current.currentTime = targetTime;
      }
    }
    setProgress(val);
  };

  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    videoRef.current.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setMuted(newMuted);
  };

  const handleBrightnessChange = (e) => {
    const val = parseFloat(e.target.value);
    setBrightness(val);
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
        resetHideTimer();
      } else if (tapCount.current >= 2) {
        if (isLeft) { skip(-10); showSkipIndicator("left"); }
        else if (isRight) { skip(10); showSkipIndicator("right"); }
        else { togglePlay(); }
      }
      tapCount.current = 0;
    }, 250);
  };

  const handleCenterPlay = (e) => {
    e.stopPropagation();
    togglePlay();
  };

  const currentVolume = muted ? 0 : volume;

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
        style={{ display: "block", filter: `brightness(${brightness})` }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          // Only use browser duration if we don't have server duration
          if (!fetchedDuration.current) {
            const dur = videoRef.current?.duration;
            if (dur && isFinite(dur) && dur > 0) {
              setDuration(dur);
            }
          }
          if (startTime > 0 && videoRef.current) {
            videoRef.current.currentTime = startTime;
          }
        }}
        onDurationChange={() => {
          // Only use browser duration if we don't have server duration
          if (!fetchedDuration.current) {
            const dur = videoRef.current?.duration;
            if (dur && isFinite(dur) && dur > 0) {
              setDuration(dur);
            }
          }
        }}
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

      {/* Brightness indicator */}
      <AnimatePresence>
        {brightnessIndicator !== null && (
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
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
              <div className="w-full rounded-full overflow-hidden" style={{ height: "4px", background: "rgba(255,255,255,0.15)" }}>
                <motion.div
                  className="h-full rounded-full bg-amber-400"
                  initial={false}
                  animate={{ width: `${brightnessIndicator}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <span className="text-white font-semibold tabular-nums" style={{ fontSize: "20px" }}>
                {brightnessIndicator}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center play icon — hanya saat pause */}
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
              <div className="relative w-full mb-3" style={{ height: "20px", display: "flex", alignItems: "center" }}>
                <div className="absolute w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.15)" }}>
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
                <div className="flex items-center gap-3 md:gap-4">

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="text-white flex-shrink-0"
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
                  <button onClick={() => { skip(-10); showSkipIndicator("left"); }} className="text-white/80 flex flex-col items-center flex-shrink-0" style={{ gap: "1px" }}>
                    <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.03v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
                    </svg>
                    <span style={{ fontSize: "9px", opacity: 0.7, lineHeight: 1 }}>10</span>
                  </button>

                  {/* Skip +10 */}
                  <button onClick={() => { skip(10); showSkipIndicator("right"); }} className="text-white/80 flex flex-col items-center flex-shrink-0" style={{ gap: "1px" }}>
                    <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.055 7.06c-1.25-.714-2.805.189-2.805 1.628v8.123c0 1.44 1.555 2.342 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.342 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256L14.805 7.06C13.555 6.346 12 7.25 12 8.688v2.34L5.055 7.06z" />
                    </svg>
                    <span style={{ fontSize: "9px", opacity: 0.7, lineHeight: 1 }}>10</span>
                  </button>

                  {/* Volume: icon + slider */}
                  <div
                    className="flex items-center gap-1.5 group/vol relative"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <button
                      onClick={toggleMute}
                      className="text-white/80 flex-shrink-0"
                      style={{ padding: "4px" }}
                    >
                      {muted || currentVolume === 0 ? (
                        <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
                        </svg>
                      ) : currentVolume < 0.5 ? (
                        <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                        </svg>
                      ) : (
                        <svg style={{ width: "20px", height: "20px" }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                        </svg>
                      )}
                    </button>

                    {/* Volume slider — show on hover + always on mobile via touch */}
                    <motion.div
                      initial={false}
                      animate={{ width: showVolumeSlider ? 72 : 0, opacity: showVolumeSlider ? 1 : 0 }}
                      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden flex-shrink-0"
                    >
                      <input
                        type="range"
                        min={0} max={1} step={0.01}
                        value={currentVolume}
                        onChange={handleVolumeChange}
                        className="w-[72px] h-1 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(90deg, #86efac ${currentVolume * 100}%, rgba(255,255,255,0.2) ${currentVolume * 100}%)`,
                          outline: "none",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </motion.div>

                    {/* Always-visible thin volume slider for mobile */}
                    <input
                      type="range"
                      min={0} max={1} step={0.01}
                      value={currentVolume}
                      onChange={handleVolumeChange}
                      className="md:hidden w-12 h-1 rounded-full appearance-none cursor-pointer flex-shrink-0"
                      style={{
                        background: `linear-gradient(90deg, #86efac ${currentVolume * 100}%, rgba(255,255,255,0.2) ${currentVolume * 100}%)`,
                        outline: "none",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white/70 font-mono tabular-nums flex-shrink-0" style={{ fontSize: "11px" }}>
                    {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 md:gap-3">

                  {/* Brightness: icon + slider */}
                  <div
                    className="hidden md:flex items-center gap-1.5 group/br relative"
                    onMouseEnter={() => setShowBrightnessSlider(true)}
                    onMouseLeave={() => setShowBrightnessSlider(false)}
                  >
                    <button
                      onClick={() => setShowBrightnessSlider(!showBrightnessSlider)}
                      className="text-white/80"
                      style={{ padding: "4px" }}
                    >
                      <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>
                    </button>

                    <motion.div
                      initial={false}
                      animate={{ width: showBrightnessSlider ? 72 : 0, opacity: showBrightnessSlider ? 1 : 0 }}
                      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden flex-shrink-0"
                    >
                      <input
                        type="range"
                        min={0} max={2} step={0.01}
                        value={brightness}
                        onChange={(e) => {
                          handleBrightnessChange(e);
                          showBrightnessPopup(parseFloat(e.target.value));
                        }}
                        className="w-[72px] h-1 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(90deg, #fbbf24 ${(brightness / 2) * 100}%, rgba(255,255,255,0.2) ${(brightness / 2) * 100}%)`,
                          outline: "none",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </motion.div>
                  </div>

                  {/* Brightness mobile button — open popup */}
                  <button
                    onClick={() => {
                      setShowBrightnessSlider(!showBrightnessSlider);
                      showBrightnessPopup(brightness);
                    }}
                    className="md:hidden text-white/80"
                    style={{ padding: "4px" }}
                  >
                    <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </button>

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
