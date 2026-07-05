"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#86efac]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#3b82f6]/10 blur-[120px]" />
      </div>

      {/* Navbar (minimalist) */}
      <nav className="w-full px-8 py-6 flex items-center justify-between relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl font-bold tracking-tight"
        >
          Rumah<span className="text-[#86efac]">Film</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        ></motion.div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#86efac]/10 border border-[#86efac]/20 text-[#16a34a] dark:text-[#86efac] text-xs font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#86efac] animate-pulse" />
            Media Server Lokal Pribadi
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            style={{ lineHeight: 1.1 }}
          >
            Nonton Film Tanpa <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#86efac] to-[#3b82f6]">
              Batas & Buffering
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Nikmati koleksi film eksklusif favorit Anda dengan kecepatan lokal.
            Bahkan saat server sedang offline, Anda selalu memiliki akses penuh
            ke dunia hiburan Anda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-semibold text-lg overflow-hidden transition-transform hover:scale-105 shadow-xl shadow-black/10 dark:shadow-white/10 w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#86efac] to-[#3b82f6] opacity-0 group-hover:opacity-20 transition-opacity" />
              Mulai Menonton
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <Link
              href="/request"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all w-full sm:w-auto"
            >
              Request Film Baru
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full"
        >
          <div className="p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#86efac]/20 text-[#16a34a] dark:text-[#86efac] flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Akses Cepat Lokal</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Streaming film tanpa buffering berkat jaringan lokal berkecepatan
              tinggi.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Pusat Request</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Ingin nonton film baru? Kirim request Anda dan pantau statusnya
              dengan mudah.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Desain Premium</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Nikmati antarmuka yang modern, bersih, dan memanjakan mata di
              perangkat apa pun.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
