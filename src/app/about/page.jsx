"use client";
import { motion } from "motion/react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function AboutPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div className="max-w-lg mx-auto px-6 py-10">

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 mb-4"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-[#86efac]/20 border border-[#86efac]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-[#16a34a] dark:text-[#86efac]">R</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Razan</h1>
                <p className="text-sm text-gray-400">Pembuat RumahFilm</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#86efac]"></span>
                  <span className="text-xs text-gray-400">Blitar, Jawa Timur</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-white/[0.06] mb-5" />

            {/* About */}
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              RumahFilm adalah platform streaming film yang saya bangun dari nol untuk menikmati koleksi film di hardisk dari perangkat manapun di jaringan rumah — bahkan dari internet.
            </p>

            {/* Tech stack */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Dibangun dengan</p>
              <div className="flex flex-wrap gap-2">
                {["Next.js", "Tailwind CSS", "Framer Motion", "Express.js", "FFmpeg", "TMDB API", "Cloudflare Tunnel", "NextAuth", "Google Sheets"].map((tech) => (
                  <span
                    key={tech}
                    className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.06] px-2.5 py-1 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-white/[0.06] mb-5" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Versi", value: "1.0.0" },
                { label: "Platform", value: "HG680P" },
                { label: "Lisensi", value: "Personal" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Support card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 mb-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">☕</span>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Support Developer</h2>
                <p className="text-xs text-gray-400">Suka dengan RumahFilm? Traktir saya kopi!</p>
              </div>
            </div>
            <a
              href="https://saweria.co/razn"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 font-medium text-sm py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Support di Saweria
            </a>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center text-xs text-gray-300 dark:text-gray-700"
          >
            RumahFilm — Dibuat dengan ❤️ oleh Razan
          </motion.p>

        </div>
      </main>
    </div>
  );
}