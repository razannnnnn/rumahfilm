"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Sidebar from "@/components/Sidebar";

/* ─────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────── */

const IconCpu = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
    />
  </svg>
);

const IconRam = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
    />
  </svg>
);

const IconDisk = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
);

const IconClock = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconServer = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-.75m19.5 0a2.25 2.25 0 00-2.25-2.25H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 19.409a2.25 2.25 0 01-1.07-1.916V17.25m19.5-13.5v.75a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 4.5v-.75m19.5 0A2.25 2.25 0 0019.5 1.5H4.5A2.25 2.25 0 002.25 3.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 5.909a2.25 2.25 0 01-1.07-1.916V3.75"
    />
  </svg>
);

/* ─────────────────────────────────────────────
   Components
   ───────────────────────────────────────────── */

function GaugeBar({ value, max = 100 }) {
  const percent = Math.min((value / max) * 100, 100);
  const getColor = () => {
    if (percent >= 90) return "#ef4444";
    if (percent >= 70) return "#f59e0b";
    return "#86efac";
  };

  return (
    <div
      className="w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden"
      style={{ height: "6px" }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="h-full rounded-full relative"
        style={{
          background: `linear-gradient(90deg, ${getColor()}99, ${getColor()})`,
        }}
      />
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span
        className={`text-xs font-medium font-mono ${accent ? "text-gray-700 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function StatCard({ title, icon, children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1], delay }}
      className={`bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#86efac]">{icon}</span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 animate-pulse">
      <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded mb-6" />
      <div className="h-8 w-24 bg-gray-200 dark:bg-white/10 rounded-lg mb-3" />
      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full mb-4" />
      <div className="h-3 w-32 bg-gray-200 dark:bg-white/5 rounded" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */

export default function MonitorPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      setError(false);
      const res = await fetch("/api/system");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setLastUpdate(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const uptimeParts = (u) => {
    if (!u) return [];
    const parts = [];
    if (u.days > 0) parts.push({ value: u.days, label: "hari" });
    if (u.hours > 0) parts.push({ value: u.hours, label: "jam" });
    parts.push({ value: u.minutes, label: "menit" });
    return parts;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monitor Server
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {error
                ? "Koneksi ke server terputus"
                : lastUpdate
                  ? `Terakhir diperbarui ${lastUpdate} · auto-refresh 5 menit`
                  : "Memuat data sistem..."}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="self-start group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                       text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/[0.06]
                       bg-white dark:bg-transparent hover:border-[#86efac]/30 hover:text-[#16a34a] dark:hover:text-[#86efac]
                       transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                       active:scale-[0.97]"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-[360deg]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
            Refresh
          </button>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-xl px-8 py-10 flex flex-col items-center gap-4 max-w-sm text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-500 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                Koneksi Terputus
              </p>
              <p className="text-xs text-gray-500">
                Server tidak merespons. Pastikan server menyala dan terhubung ke
                jaringan.
              </p>
              <button
                onClick={fetchData}
                className="mt-1 px-4 py-2 rounded-lg text-xs font-medium text-[#16a34a] dark:text-[#86efac] bg-[#86efac]/10 border border-[#86efac]/30 hover:bg-[#86efac]/20 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ── CPU — full width ── */}
            <div className="md:col-span-2">
              <StatCard title="CPU" icon={<IconCpu />} delay={0}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                      {data?.cpu ?? "—"}
                    </span>
                    <span className="text-sm text-gray-400">%</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {data?.cpuCores ?? "—"} core
                  </span>
                </div>
                <GaugeBar value={data?.cpu ?? 0} />
                {data?.cpuModel && (
                  <p
                    className="text-xs text-gray-400 mt-2 truncate"
                    title={data.cpuModel}
                  >
                    {data.cpuModel}
                  </p>
                )}
              </StatCard>
            </div>

            {/* ── RAM ── */}
            <StatCard title="RAM" icon={<IconRam />} delay={0.06}>
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                    {data?.ram?.used ?? "—"}
                  </span>
                  <span className="text-sm text-gray-400">MB</span>
                </div>
              </div>
              <GaugeBar value={data?.ram?.percent ?? 0} />
              <div className="mt-3 space-y-1">
                <MiniStat
                  label="Total"
                  value={`${data?.ram?.total ?? "—"} MB`}
                />
                <MiniStat
                  label="Bebas"
                  value={`${data?.ram?.free ?? "—"} MB`}
                  accent
                />
                <MiniStat
                  label="Terpakai"
                  value={`${data?.ram?.percent ?? "—"}%`}
                />
              </div>
            </StatCard>

            {/* ── Disk ── */}
            <StatCard title="Penyimpanan" icon={<IconDisk />} delay={0.12}>
              <div className="flex items-end justify-between mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                    {data?.disk?.used ?? "—"}
                  </span>
                  <span className="text-sm text-gray-400">GB</span>
                </div>
              </div>
              <GaugeBar value={data?.disk?.percent ?? 0} />
              <div className="mt-3 space-y-1">
                <MiniStat
                  label="Total"
                  value={`${data?.disk?.total ?? "—"} GB`}
                />
                <MiniStat
                  label="Bebas"
                  value={`${data?.disk?.free ?? "—"} GB`}
                  accent
                />
                <MiniStat
                  label="Terpakai"
                  value={`${data?.disk?.percent ?? "—"}%`}
                />
              </div>
            </StatCard>

            {/* ── Uptime — full width ── */}
            <div className="md:col-span-2">
              <StatCard title="Uptime" icon={<IconClock />} delay={0.18}>
                <div className="flex flex-wrap items-end gap-4 mb-4">
                  {uptimeParts(data?.uptime).map((seg, i) => (
                    <div key={i} className="flex items-baseline gap-1">
                      <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {seg.value}
                      </span>
                      <span className="text-sm text-gray-400">{seg.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-pulse" />
                  <span className="text-xs text-gray-400">Server aktif</span>
                </div>
              </StatCard>
            </div>

            {/* ── Info Server — full width ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.32, 0.72, 0, 1],
                delay: 0.24,
              }}
              className="md:col-span-2"
            >
              <div className="bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#86efac]">
                    <IconServer />
                  </span>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Info Server
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
                  <MiniStat label="Hostname" value={data?.hostname} accent />
                  <MiniStat label="Platform" value={data?.platform} accent />
                  <MiniStat
                    label="CPU Cores"
                    value={data?.cpuCores ? `${data.cpuCores} core` : "—"}
                    accent
                  />
                  <MiniStat
                    label="Update Terakhir"
                    value={
                      data?.updatedAt
                        ? new Date(data.updatedAt).toLocaleTimeString("id-ID")
                        : "—"
                    }
                    accent
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
