"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { getHistory, removeHistory, clearHistory, formatWatchedAt, formatDuration } from "@/lib/history";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setLoaded(true);
  }, []);

  const handleRemove = (id) => {
    removeHistory(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    if (confirm("Hapus semua riwayat?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div className="px-6 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Riwayat Tontonan</h1>
              <p className="text-xs text-gray-400 mt-0.5">{history.length} film ditonton</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
              >
                Hapus semua
              </button>
            )}
          </div>

          {/* Empty state */}
          {loaded && history.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.06] flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada riwayat</p>
              <p className="text-xs text-gray-400 dark:text-gray-600">Film yang kamu tonton akan muncul di sini</p>
              <Link
                href="/"
                className="mt-2 text-xs text-[#16a34a] dark:text-[#86efac] border border-[#86efac]/30 bg-[#86efac]/10 px-4 py-2 rounded-lg hover:bg-[#86efac]/20 transition-colors"
              >
                Mulai nonton
              </Link>
            </motion.div>
          )}

          {/* Grid history */}
          {history.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="group relative"
                  >
                    <Link href={`/watch/${item.id}?t=${item.currentTime}`}>
                      <div className="bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-xl overflow-hidden hover:border-[#86efac]/40 transition-all duration-200">

                        {/* Poster */}
                        <div className="relative bg-gray-100 dark:bg-[#222226]" style={{ aspectRatio: "2/3" }}>
                          {item.poster ? (
                            <Image
                              src={item.poster}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 50vw, 20vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </div>
                          )}

                          {/* Hover play */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="w-11 h-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100">
                              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                            <div
                              className="h-full bg-[#86efac]"
                              style={{ width: `${Math.min((item.currentTime / 7200) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="px-3 py-2.5">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatDuration(item.currentTime)} • {formatWatchedAt(item.watchedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Tombol hapus */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}