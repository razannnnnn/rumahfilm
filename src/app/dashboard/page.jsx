import { Suspense } from "react";
import HeroBanner from "@/components/HeroBanner";
import FilmGridFetcher from "@/components/FilmGridFetcher";
import FilmGridSkeleton from "@/components/FilmGridSkeleton";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

async function getFilmsForHero() {
  const serverUrl = process.env.STB_URL || "http://localhost:4000";
  const vercelUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const seed = Date.now();

  let films = [];
  try {
    const filmsRes = await fetch(`${serverUrl}/api/films`, { cache: "no-store" });
    if (!filmsRes.ok) return { films: [], seed };
    const data = await filmsRes.json();
    films = Array.isArray(data.films) ? data.films : [];
  } catch {
    return { films: [], seed };
  }

  const filmsWithMeta = await Promise.all(
    films.map(async (film) => {
      try {
        const metaUrl = `${vercelUrl}/api/metadata?title=${encodeURIComponent(film.title)}&year=${film.year || ""}`;
        const metaRes = await fetch(metaUrl, { cache: "no-store" });
        if (!metaRes.ok) throw new Error("metadata gagal");
        const meta = await metaRes.json();
        return {
          ...film,
          poster: meta.found ? meta.poster : null,
          rating: meta.found ? meta.rating : null,
          overview: meta.found ? meta.overview : null,
          backdrop: meta.found ? meta.backdrop : null,
          genres: meta.found ? (meta.genres || []) : [],
        };
      } catch (e) {
        return { ...film, poster: null, rating: null, overview: null, backdrop: null, genres: [] };
      }
    })
  );

  return { films: filmsWithMeta, seed };
}

export default async function DashboardPage() {
  const { films: heroFilms, seed: heroSeed } = await getFilmsForHero();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <HeroBanner films={heroFilms} seed={heroSeed} />

        {/* Film grid with Suspense — skeleton shows while streaming */}
        <Suspense fallback={<FilmGridSkeleton />}>
          <FilmGridFetcher />
        </Suspense>
      </main>
    </div>
  );
}
