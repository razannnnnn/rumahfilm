"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "@/components/Sidebar";

export default function RequestPage() {
  const [nama, setNama] = useState("");
  const [judul, setJudul] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, judul }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
      } else {
        setSuccess(true);
        setNama("");
        setJudul("");
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError("Gagal mengirim request, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div className="max-w-lg mx-auto px-6 py-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Request Film
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Mau nonton film tapi belum ada? Request di sini!
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Nama */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Nama kamu
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama kamu"
                  required
                  maxLength={100}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#86efac]/50 transition-colors"
                />
              </div>

              {/* Judul Film */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Judul film yang direquest
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Inception (2010)"
                  required
                  maxLength={200}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#86efac]/50 transition-colors"
                />
                <p className="text-xs text-gray-400">
                  Tambahkan tahun rilis jika tahu, contoh: Dune (2021)
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-[#16a34a] dark:text-[#86efac] bg-[#86efac]/10 border border-[#86efac]/30 px-3 py-2 rounded-lg"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Request berhasil dikirim! Kami akan segera memprosesnya.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#86efac]/20 hover:bg-[#86efac]/30 text-[#16a34a] dark:text-[#86efac] border border-[#86efac]/40 font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : "Kirim Request"}
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 Request akan diproses dalam 1–3 hari. Kamu akan diberitahu kalau film sudah tersedia di RumahFilm.
            </p>
          </motion.div>

        </div>
      </main>
    </div>
  );
}