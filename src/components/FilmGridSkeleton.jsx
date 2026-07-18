"use client";

import "@aejkatappaja/phantom-ui";

export default function FilmGridSkeleton({ count = 12 }) {
  return (
    <div style={{ padding: "24px 32px" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Semua Film</h1>
        </div>
      </div>

      {/* Grid skeleton — each card wrapped in phantom-ui */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <phantom-ui
            key={i}
            loading
            animation="shimmer"
            shimmer-color="rgba(134,239,172,0.15)"
            background-color="rgba(134,239,172,0.06)"
          >
            <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-white/[0.06]">
              <div
                className="bg-gray-100 dark:bg-[#222226]"
                style={{ aspectRatio: "2/3", width: "100%" }}
              />
              <div className="px-3 py-2.5">
                <div className="rounded h-4" style={{ width: "80%" }}>
                  Judul Film
                </div>
                <div className="rounded h-3 mt-2" style={{ width: "40%" }}>
                  2024
                </div>
              </div>
            </div>
          </phantom-ui>
        ))}
      </div>
    </div>
  );
}
