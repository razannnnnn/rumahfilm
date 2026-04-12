const config = {
  filmsPath: process.env.FILMS_PATH || "/mnt/harddisk/Film",
  tmdbApiKey: process.env.TMDB_API_KEY || "",
  tmdbBaseUrl: "https://api.themoviedb.org/3",
  tmdbImageBase: "https://image.tmdb.org/t/p/w500",
  supportedFormats: [".mp4", ".mkv", ".avi", ".mov", ".webm", ".m4v"],
  tmdbGenres: {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
    80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
    14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
    9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
    53: "Thriller", 10752: "War", 37: "Western",
  },
};

export default config;