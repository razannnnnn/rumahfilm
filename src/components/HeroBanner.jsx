"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export default function HeroBanner({ films }) {
  const featured = films.filter((f) => f.backdrop);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const goNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % featured.length);
  };

  if (!featured.length) return null;

  const film = featured[current];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      className="relative overflow-hidden border-b border-gray-200 dark:border-white/[0.06] h-[320px] md:h-[500px]"
    >
      {/* Slide */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={film.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Backdrop */}
          {film.backdrop ? (
            <img
              src={film.backdrop}
              alt={film.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#86efac]/20 to-gray-100 dark:to-[#1c1c1f]" />
          )}

          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50/95 dark:from-[#111113]/95 via-gray-50/60 dark:via-[#111113]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#111113] via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 pl-12 md:pl-8 pb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-medium text-[#16a34a] dark:text-[#86efac] border border-[#86efac]/40 bg-[#86efac]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                Pilihan Utama
              </span>
              {film.rating && (
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded">
                  ★ {film.rating}
                </span>
              )}
            </div>
            <Link href={`/film/${film.id}`}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1 hover:text-[#86efac] transition-colors cursor-pointer">
                {film.title}
              </h2>
            </Link>
            {film.overview && (
              <p
                className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
                style={{ maxWidth: "420px" }}
              >
                {film.overview}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Tombol panah */}
      {featured.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicator */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? "20px" : "6px",
                height: "6px",
                background: i === current ? "#86efac" : "rgba(134,239,172,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}