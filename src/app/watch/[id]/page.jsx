import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getFilm(id) {
  const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${stbUrl}/api/films`, { cache: "no-store" });
  const { films } = await res.json();
  const film = films.find((f) => f.id === id) || null;
  if (!film) return null;

  // Fetch poster dari TMDB
  try {
    const metaRes = await fetch(
      `${baseUrl}/api/metadata?title=${encodeURIComponent(film.title)}&year=${film.year || ""}`,
      { cache: "force-cache" }
    );
    const meta = await metaRes.json();
    return {
      ...film,
      poster: meta.found ? meta.poster : null,
    };
  } catch {
    return { ...film, poster: null };
  }
}

export default async function WatchPage({ params }) {
  const { id } = await params;
  const film = await getFilm(id);
  if (!film) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0b] flex flex-col">
      {/* Mini navbar */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link
            href={`/film/${film.id}`}
            className="text-gray-500 hover:text-[#86efac] transition-colors border border-white/[0.06] hover:border-[#86efac]/30 p-1.5 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="h-4 w-px bg-white/10"></div>
          <span className="text-sm font-medium text-gray-200">{film.title}</span>
          {film.year && (
            <span className="text-xs text-gray-600 border border-white/[0.06] px-2 py-0.5 rounded">
              {film.year}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full" style={{ maxWidth: "900px" }}>
          {/* Pass poster ke VideoPlayer */}
          <VideoPlayer
            filmId={film.id}
            title={film.title}
            poster={film.poster}
          />
        </div>
      </div>
    </main>
  );
}