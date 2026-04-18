export default function PageLoadingSpinner({ label = "Memuat..." }) {
  return (
    <div
      style={{ display: "flex", minHeight: "100vh" }}
      className="bg-gray-50 dark:bg-[#111113]"
    >
      {/* Placeholder sidebar agar layout tidak loncat */}
      <div
        className="hidden md:block flex-shrink-0 border-r border-gray-200 dark:border-white/[0.06]"
        style={{ width: "220px" }}
      />

      {/* Konten loading */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {/* Spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#86efac]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#86efac] animate-spin" />
        </div>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}