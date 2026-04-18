import { NextResponse } from "next/server";
import config from "../../../../config";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const year = searchParams.get("year");

  if (!title) {
    return NextResponse.json({ error: "Title diperlukan" }, { status: 400 });
  }

  try {
    const query = encodeURIComponent(title);
    const yearParam = year ? `&year=${year}` : "";
    const url = `${config.tmdbBaseUrl}/search/movie?api_key=${config.tmdbApiKey}&query=${query}${yearParam}&language=en-US`;

    const res = await fetch(url, {
      next: { revalidate: 86400 } // cache 24 jam via Next.js cache
    });
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ found: false });
    }

    const movie = data.results[0];
    return NextResponse.json({
      found: true,
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster: movie.poster_path ? `${config.tmdbImageBase}${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
      rating: movie.vote_average?.toFixed(1),
      releaseDate: movie.release_date,
      genres: (movie.genre_ids || []).map((id) => config.tmdbGenres[id]).filter(Boolean),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}