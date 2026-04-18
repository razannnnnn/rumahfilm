import SidebarWrapper from "@/components/SidebarWrapper";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getFilmDetail(id) {
  const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  const filmsRes = await fetch(`${stbUrl}/api/films`, { cache: "no-store" });
  const { films } = await filmsRes.json();
  const film = films.find((f) => f.id === id);
  if (!film) return null;
  const metaRes = await fetch(
    `${baseUrl}/api/metadata?title=${encodeURIComponent(film.title)}&year=${film.year || ""}`,
    { cache: "force-cache" }
  );
  const meta = await metaRes.json();
  return { ...film, ...(meta.found ? meta : {}) };
}

export default async function FilmDetailPage({ params }) {
  const { id } = await params;
  const film = await getFilmDetail(id);
  if (!film) notFound();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111113]">
      <Sidebar />
      <main className="flex-1 min-w-0">

        {/* Backdrop */}
        <div className="relative h-48 md:h-72 overflow-hidden border-b border-gray-200 dark:border-white/[0.06]">
          {film.backdrop ? (
            <img src={film.backdrop} alt={film.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#86efac]/10 to-gray-100 dark:to-[#1c1c1f]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#111113] via-gray-50/50 dark:via-[#111113]/50 to-transparent" />
        </div>

        <div className="px-4 md:px-8 py-6">
          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#16a34a] dark:hover:text-[#86efac] transition-colors mb-6 border border-gray-200 dark:border-white/[0.06] hover:border-[#86efac]/30 px-3 py-1.5 rounded-lg"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Kembali
          </Link>

          {/* Poster + Info — stack di mobile, row di desktop */}
          <div className="flex flex-col md:flex-row gap-6 md:-mt-16 items-start">
            {/* Poster */}
            {film.poster && (
              <div className="relative w-28 h-42 md:w-32 md:h-48 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg"
                style={{ width: "112px", height: "168px" }}
              >
<Image 
  src={film.poster} 
  alt={film.title} 
  fill 
  className="object-cover"
  sizes="(max-width: 768px) 112px, 128px"
/>              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 md:pt-16">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{film.title}</h1>

              <div className="flex flex-wrap gap-2 mt-3">
                {film.year && (
                  <span className="text-xs text-gray-500 border border-gray-200 dark:border-white/[0.08] bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                    {film.year}
                  </span>
                )}
                {film.rating && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-400/10 px-2.5 py-1 rounded-lg font-medium">
                    ★ {film.rating}
                  </span>
                )}
                {film.ext && (
                  <span className="text-xs text-gray-400 border border-gray-200 dark:border-white/[0.08] bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg uppercase">
                    {film.ext.replace(".", "")}
                  </span>
                )}
                <span className="text-xs text-gray-400 border border-gray-200 dark:border-white/[0.08] bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  {film.sizeGB} GB
                </span>
              </div>

              {film.overview && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                  {film.overview}
                </p>
              )}

              <Link
                href={`/watch/${film.id}`}
                className="inline-flex items-center gap-2 mt-5 bg-[#86efac]/15 hover:bg-[#86efac]/25 text-[#16a34a] dark:text-[#86efac] border border-[#86efac]/40 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
                Putar Film
              </Link>
            </div>
          </div>

          {film.releaseDate && (
            <div className="mt-8 pt-5 border-t border-gray-200 dark:border-white/[0.06]">
              <p className="text-xs text-gray-400">
                Tanggal rilis:{" "}
                <span className="text-gray-600 dark:text-gray-300">
                  {new Date(film.releaseDate).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}