import { NextResponse } from "next/server";
import config from "../../../../config";
import { getMetadataCache, setMetadataCache } from "@/lib/cache";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const year = searchParams.get("year");

  if (!title) {
    return NextResponse.json({ error: "Title diperlukan" }, { status: 400 });
  }

  try {
    // Cek cache dulu
    const cached = getMetadataCache(title, year);
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }

    const query = encodeURIComponent(title);
    const yearParam = year ? `&year=${year}` : "";
    const url = `${config.tmdbBaseUrl}/search/movie?api_key=${config.tmdbApiKey}&query=${query}${yearParam}&language=en-US`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      const result = { found: false };
      setMetadataCache(title, year, result); // cache juga kalau tidak ketemu
      return NextResponse.json(result);
    }

    const movie = data.results[0];
    const result = {
      found: true,
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster: movie.poster_path
        ? `${config.tmdbImageBase}${movie.poster_path}`
        : null,
      backdrop: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
      rating: movie.vote_average?.toFixed(1),
      releaseDate: movie.release_date,
    };

    // Simpan ke cache
    setMetadataCache(title, year, result);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}