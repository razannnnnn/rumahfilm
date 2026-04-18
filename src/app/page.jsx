import HeroBanner from "@/components/HeroBanner";
import FilmGrid from "@/components/FilmGrid";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

async function getFilmsWithMetadata() {
  const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  const filmsRes = await fetch(`${stbUrl}/api/films`, { cache: "no-store" });
  const { films } = await filmsRes.json();

  const filmsWithMeta = await Promise.all(
    films.map(async (film) => {
      try {
        const metaRes = await fetch(
          `${baseUrl}/api/metadata?title=${encodeURIComponent(film.title)}&year=${film.year || ""}`,
          { cache: "no-store" }
        );
        const meta = await metaRes.json();
        return {
          ...film,
          poster: meta.found ? meta.poster : null,
          rating: meta.found ? meta.rating : null,
          overview: meta.found ? meta.overview : null,
          backdrop: meta.found ? meta.backdrop : null,
          genres: meta.found ? (meta.genres || []) : [],
        };
      } catch {
        return { ...film, poster: null, rating: null, overview: null, backdrop: null, genres: null, };
      }
    })
  );

  return filmsWithMeta;
}

export default async function HomePage() {
  const films = await getFilmsWithMetadata();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50 dark:bg-[#111113]">
      <Sidebar />

      {/* Main — flex-1 otomatis mengisi sisa ruang setelah sidebar */}
      <main style={{ flex: 1, minWidth: 0 }}>

        {/* Hero banner */}
        <HeroBanner films={films} />

        {/* Film grid */}
        <FilmGrid films={films} />

      </main>
    </div>
  );
}