"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function STBStatus() {
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkSTB = async () => {
    try {
      const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
      const res = await fetch(`${stbUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      setOffline(!res.ok);
    } catch {
      setOffline(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSTB();
    // Cek setiap 30 detik
    const interval = setInterval(checkSTB, 30000);
    return () => clearInterval(interval);
  }, []);

  if (checking || !offline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
          <p className="text-xs text-amber-500 font-medium">
            STB tidak dapat dijangkau — film tidak dapat diputar saat ini
          </p>
        </div>
        <button
          onClick={checkSTB}
          className="text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
        >
          Cek ulang
        </button>
      </motion.div>
    </AnimatePresence>
  );
}