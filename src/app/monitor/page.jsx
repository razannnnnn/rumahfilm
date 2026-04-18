"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Sidebar from "@/components/Sidebar";

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

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200 font-mono">{value ?? "—"}</span>
    </div>
  );
}

const IconCpu = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </svg>
);

const IconRam = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>
);

const IconDisk = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const IconUptime = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconServer = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-.75m19.5 0a2.25 2.25 0 00-2.25-2.25H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 19.409a2.25 2.25 0 01-1.07-1.916V17.25m19.5-13.5v.75a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 4.5v-.75m19.5 0A2.25 2.25 0 0019.5 1.5H4.5A2.25 2.25 0 002.25 3.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 5.909a2.25 2.25 0 01-1.07-1.916V3.75" />
  </svg>
);

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
      setLastUpdate(new Date().toLocaleTimeString("id-ID"));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // 5 menit
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (uptime) => {
    if (!uptime) return "—";
    const parts = [];
    if (uptime.days > 0) parts.push(`${uptime.days}h`);
    if (uptime.hours > 0) parts.push(`${uptime.hours}j`);
    parts.push(`${uptime.minutes}m`);
    return parts.join(" ");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0 }} className="px-6 md:px-10 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Monitor STB</h1>
            <p className="text-xs text-gray-400 mt-1">
              {error
                ? "⚠ Gagal terhubung ke STB"
                : lastUpdate
                ? `Update terakhir: ${lastUpdate} · refresh otomatis 5 menit`
                : "Memuat data..."}
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3" style={{ paddingTop: "80px" }}>
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-gray-400">Tidak bisa terhubung ke STB</p>
            <button onClick={fetchData} className="text-xs text-[#86efac] underline">Coba lagi</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>

            {/* CPU */}
            <StatCard title="CPU" index={0} icon={<IconCpu />}>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{data?.cpu ?? "—"}</span>
                <span className="text-sm text-gray-400 mb-1">%</span>
              </div>
              <GaugeBar value={data?.cpu ?? 0} />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">Penggunaan CPU</p>
                <p className="text-xs text-gray-400">{data?.cpuCores} core</p>
              </div>
              {data?.cpuModel && (
                <p className="text-xs text-gray-300 dark:text-gray-500 mt-1 truncate" title={data.cpuModel}>
                  {data.cpuModel}
                </p>
              )}
            </StatCard>

            {/* RAM */}
            <StatCard title="RAM" index={1} icon={<IconRam />}>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {data?.ram?.used ?? "—"}
                </span>
                <span className="text-sm text-gray-400 mb-1">/ {data?.ram?.total} MB</span>
              </div>
              <GaugeBar value={data?.ram?.percent ?? 0} />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{data?.ram?.percent ?? "—"}% terpakai</p>
                <p className="text-xs text-gray-400">{data?.ram?.free} MB bebas</p>
              </div>
            </StatCard>

            {/* Disk */}
            <StatCard title="Penyimpanan" index={2} icon={<IconDisk />}>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {data?.disk?.used ?? "—"}
                </span>
                <span className="text-sm text-gray-400 mb-1">/ {data?.disk?.total ?? "—"} GB</span>
              </div>
              <GaugeBar value={data?.disk?.percent ?? 0} />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">{data?.disk?.percent ?? "—"}% terpakai</p>
                <p className="text-xs text-gray-400">{data?.disk?.free ?? "—"} GB bebas</p>
              </div>
            </StatCard>

            {/* Uptime */}
            <StatCard title="Uptime" index={3} icon={<IconUptime />}>
              <div className="flex items-end gap-1 mb-4">
                {data?.uptime?.days > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">{data.uptime.days}</p>
                    <p className="text-xs text-gray-400">hari</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{data?.uptime?.hours ?? "—"}</p>
                  <p className="text-xs text-gray-400">jam</p>
                </div>
                <p className="text-3xl font-semibold text-gray-400 mb-4">:</p>
                <div className="text-center">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{data?.uptime?.minutes ?? "—"}</p>
                  <p className="text-xs text-gray-400">menit</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#86efac] animate-pulse" />
                <p className="text-xs text-gray-400">STB aktif</p>
              </div>
            </StatCard>

            {/* Info Server — full width */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 4 * 0.07 }}
              className="bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5"
              style={{ gridColumn: "1 / -1" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#86efac]"><IconServer /></span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Info Server</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8">
                <MetaRow label="Hostname" value={data?.hostname} />
                <MetaRow label="Platform" value={data?.platform} />
                <MetaRow label="CPU Cores" value={data?.cpuCores ? `${data.cpuCores} core` : "—"} />
                <MetaRow label="Data dari STB" value={data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString("id-ID") : "—"} />
              </div>
            </motion.div>

          </div>
        )}
      </main>
    </div>
  );
}