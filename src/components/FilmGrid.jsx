"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import FilmCard from "@/components/FilmCard";

export default function FilmGrid({ films }) {
  const [query, setQuery] = useState("");

  const filtered = films.filter((film) =>
    film.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* Header + Search */}
      <div style={{ marginBottom: "20px" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Semua Film</h1>
            <p className="text-xs text-gray-400" style={{ marginTop: "4px" }}>
              {filtered.length === films.length
                ? `${films.length} film tersedia`
                : `${filtered.length} dari ${films.length} film`}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari film..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#86efac]/50 dark:focus:border-[#86efac]/40 transition-colors"
              style={{ width: "220px" }}
            />
            {/* Tombol clear */}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.map((film, index) => (
              <FilmCard key={film.id} film={film} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center"
            style={{ paddingTop: "80px" }}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Film tidak ditemukan</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Coba kata kunci lain</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}