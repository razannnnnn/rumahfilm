import FilmGrid from "./FilmGrid";

async function getFilmsWithMetadata() {
  const serverUrl = process.env.STB_URL || "http://localhost:4000";
  const vercelUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let films = [];
  try {
    const filmsRes = await fetch(`${serverUrl}/api/films`, { cache: "no-store" });
    if (!filmsRes.ok) return [];
    const data = await filmsRes.json();
    films = Array.isArray(data.films) ? data.films : [];
  } catch {
    return [];
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

  return filmsWithMeta;
}

export default async function FilmGridFetcher() {
  const films = await getFilmsWithMetadata();
  return <FilmGrid films={films} />;
}
