"use client";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";

export default function FilmCard({ film, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="group"
    >
      <Link href={`/film/${film.id}`}>
        <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] hover:border-[#86efac]/50 dark:hover:border-[#86efac]/30 transition-all duration-200">
          {/* Poster */}
          <div className="relative aspect-[2/3] bg-gray-100 dark:bg-[#222226] overflow-hidden">
            {film.poster ? (
              <Image
                src={film.poster}
                alt={film.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400 text-center leading-tight">{film.title}</span>
              </div>
            )}

            {/* Hover play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100">
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Rating */}
            {film.rating && (
              <div
    style={{
      position: "absolute",
      top: "8px",
      right: "8px",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      color: "#86efac",
      fontSize: "10px",
      fontWeight: "600",
      padding: "3px 5px",
      borderRadius: "8px",
      border: "1px solid rgba(134,239,172,0.25)",
      letterSpacing: "0.03em",
    }}
  >
    ★ {film.rating}
  </div>
            )}
          </div>

          {/* Info */}
          <div className="px-3 py-2.5">
            <p className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate">{film.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-gray-400">{film.year ?? "—"}</span>
              <span className="text-[11px] text-gray-300 dark:text-gray-700">{film.sizeGB} GB</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}