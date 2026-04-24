import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111113] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-gray-200 dark:text-white/5 mb-4">404</div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#86efac]/20 hover:bg-[#86efac]/30 text-[#16a34a] dark:text-[#86efac] border border-[#86efac]/40 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}