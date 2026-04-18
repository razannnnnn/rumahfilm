"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });

function GaugeBar({ value, max = 100, color = "#86efac" }) {
  const percent = Math.min((value / max) * 100, 100);
  const getColor = () => {
    if (percent >= 90) return "#f87171";
    if (percent >= 70) return "#fbbf24";
    return color;
  };
  return (
    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden" style={{ height: "6px" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: getColor() }}
      />
    </div>
  );
}

function StatCard({ title, icon, children, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#86efac]">{icon}</span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

export default function MonitorPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/system");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date().toLocaleTimeString("id-ID"));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }} className="px-6 md:px-10 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Monitor STB</h1>
            <p className="text-xs text-gray-400 mt-1">
              {lastUpdate ? `Update terakhir: ${lastUpdate}` : "Memuat data..."}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-[#86efac] border border-[#86efac]/30 bg-[#86efac]/10 hover:bg-[#86efac]/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ paddingTop: "80px" }}>
            <p className="text-sm text-gray-400">Memuat data sistem...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>

            {/* CPU */}
            <StatCard title="CPU" index={0} icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
              </svg>
            }>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{data?.cpu ?? "—"}</span>
                <span className="text-sm text-gray-400 mb-1">%</span>
              </div>
              <GaugeBar value={data?.cpu ?? 0} />
              <p className="text-xs text-gray-400 mt-2">Penggunaan CPU</p>
            </StatCard>

            {/* RAM */}
            <StatCard title="RAM" index={1} icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            }>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{data?.ram?.used ?? "—"}</span>
                <span className="text-sm text-gray-400 mb-1">/ {data?.ram?.total} MB</span>
              </div>
              <GaugeBar value={data?.ram?.percent ?? 0} />
              <p className="text-xs text-gray-400 mt-2">{data?.ram?.percent ?? "—"}% terpakai</p>
            </StatCard>

            {/* Temperature */}
            <StatCard title="Suhu CPU" index={2} icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
            }>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {data?.temperature ?? "—"}
                </span>
                <span className="text-sm text-gray-400 mb-1">°C</span>
              </div>
              <GaugeBar value={data?.temperature ?? 0} max={100} />
              <p className="text-xs text-gray-400 mt-2">
                {data?.temperature >= 80 ? "⚠ Terlalu panas!" : data?.temperature >= 60 ? "Hangat" : "Normal"}
              </p>
            </StatCard>

            {/* HDD */}
            <StatCard title="Penyimpanan" index={3} icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            }>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{data?.hdd?.used ?? "—"}</span>
                <span className="text-sm text-gray-400 mb-1">/ {data?.hdd?.total ?? "—"}</span>
              </div>
              <GaugeBar value={data?.hdd?.percent ?? 0} />
              <p className="text-xs text-gray-400 mt-2">{data?.hdd?.free ?? "—"} tersisa · {data?.hdd?.percent ?? "—"}% terpakai</p>
            </StatCard>

            {/* Network + Uptime */}
            <StatCard title="Jaringan & Uptime" index={4} icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
              </svg>
            }>
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">IP LAN</p>
                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{data?.ip ?? "—"}</p>
              </div>
              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-3">
                <p className="text-xs text-gray-400 mb-1">Uptime STB</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{data?.uptime ?? "—"}</p>
              </div>
            </StatCard>

          </div>
        )}
      </main>
    </div>
  );
}