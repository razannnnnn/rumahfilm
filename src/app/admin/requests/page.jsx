"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "@/components/Sidebar";

const STATUS_COLORS = {
  Pending: "text-amber-500 bg-amber-400/10 border-amber-400/20",
  Diproses: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Tersedia: "text-[#86efac] bg-[#86efac]/10 border-[#86efac]/20",
  Ditolak: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      console.error("Gagal fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, catatan = "") => {
    setUpdating(id);
    try {
      await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, catatan }),
      });
      await fetchRequests();
    } catch {
      console.error("Gagal update status");
    } finally {
      setUpdating(null);
    }
  };

  const filters = ["Semua", "Pending", "Diproses", "Tersedia", "Ditolak"];

  const filtered = filter === "Semua"
    ? requests
    : requests.filter((r) => r.status === filter);

  const counts = {
    Semua: requests.length,
    Pending: requests.filter((r) => r.status === "Pending").length,
    Diproses: requests.filter((r) => r.status === "Diproses").length,
    Tersedia: requests.filter((r) => r.status === "Tersedia").length,
    Ditolak: requests.filter((r) => r.status === "Ditolak").length,
  };

  if (status === "loading") return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div className="px-6 md:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Request Film
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {requests.length} total request masuk
              </p>
            </div>
            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-200 dark:border-white/[0.06] px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  filter === f
                    ? "bg-[#86efac]/10 text-[#16a34a] dark:text-[#86efac] border-[#86efac]/30"
                    : "text-gray-500 border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/10"
                }`}
              >
                {f}
                <span className="ml-1.5 text-[10px] opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-sm text-gray-400">Memuat data...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <div className="text-3xl">🎬</div>
              <p className="text-sm text-gray-400">Belum ada request</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {filtered.map((req, index) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {req.judul}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${STATUS_COLORS[req.status] || STATUS_COLORS.Pending}`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">
                            👤 {req.nama}
                          </span>
                          <span className="text-xs text-gray-300 dark:text-gray-700">•</span>
                          <span className="text-xs text-gray-400">
                            🕐 {req.timestamp}
                          </span>
                        </div>
                        {req.catatan && (
                          <p className="text-xs text-gray-400 mt-1.5 italic">
                            Catatan: {req.catatan}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {req.status === "Pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, "Diproses")}
                              disabled={updating === req.id}
                              className="text-[11px] px-2.5 py-1 rounded-lg border border-blue-400/30 text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-colors disabled:opacity-50"
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => updateStatus(req.id, "Ditolak")}
                              disabled={updating === req.id}
                              className="text-[11px] px-2.5 py-1 rounded-lg border border-red-400/30 text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {req.status === "Diproses" && (
                          <button
                            onClick={() => updateStatus(req.id, "Tersedia")}
                            disabled={updating === req.id}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-[#86efac]/30 text-[#86efac] bg-[#86efac]/10 hover:bg-[#86efac]/20 transition-colors disabled:opacity-50"
                          >
                            Tandai Tersedia
                          </button>
                        )}
                        {(req.status === "Tersedia" || req.status === "Ditolak") && (
                          <button
                            onClick={() => updateStatus(req.id, "Pending")}
                            disabled={updating === req.id}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/[0.08] text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
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