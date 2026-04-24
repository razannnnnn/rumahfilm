"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isSTBOffline =
    error?.message?.includes("fetch failed") ||
    error?.message?.includes("ECONNREFUSED") ||
    error?.message?.includes("network") ||
    error?.message?.includes("ETIMEDOUT");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.06] flex items-center justify-center mx-auto mb-4">
          {isSTBOffline ? (
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 5.636a9 9 0 1012.728 12.728M5.636 5.636A9 9 0 0118.364 18.364M5.636 5.636L18.364 18.364" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {isSTBOffline ? "STB Tidak Dapat Dijangkau" : "Terjadi Kesalahan"}
        </h1>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-2">
          {isSTBOffline
            ? "Server film di rumah tidak merespons. Pastikan STB menyala dan terhubung ke internet."
            : "Terjadi kesalahan yang tidak terduga. Coba refresh halaman."}
        </p>

        {/* STB checklist */}
        {isSTBOffline && (
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-medium text-amber-500 mb-2">Cek hal berikut:</p>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                STB HG680P menyala
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                Koneksi internet rumah aktif
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                Cloudflare Tunnel berjalan (pm2 status)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                Service rumahfilm-stb online (pm2 status)
              </li>
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-[#86efac]/20 hover:bg-[#86efac]/30 text-[#16a34a] dark:text-[#86efac] border border-[#86efac]/40 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-200 dark:border-white/[0.06] px-4 py-2 rounded-xl transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}