const config = {
  filmsPath: process.env.FILMS_PATH || "/mnt/harddisk/Film",
  tmdbApiKey: process.env.TMDB_API_KEY || "",
  tmdbBaseUrl: "https://api.themoviedb.org/3",
  tmdbImageBase: "https://image.tmdb.org/t/p/w500",
  supportedFormats: [".mp4", ".mkv", ".avi", ".mov", ".webm", ".m4v"],
};

export default config;