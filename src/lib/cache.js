import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "cache");
const METADATA_CACHE_DIR = path.join(CACHE_DIR, "metadata");
const FILMS_CACHE_FILE = path.join(CACHE_DIR, "films.json");
const FILMS_CACHE_TTL = 5 * 60 * 1000; // 5 menit

// Pastikan folder cache ada
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);
  if (!fs.existsSync(METADATA_CACHE_DIR)) fs.mkdirSync(METADATA_CACHE_DIR);
}

// Cache metadata TMDB per film
export function getMetadataCache(title, year) {
  ensureCacheDir();
  const key = `${title}_${year || "unknown"}`.replace(/[^a-zA-Z0-9_]/g, "_");
  const file = path.join(METADATA_CACHE_DIR, `${key}.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    return data;
  }
  return null;
}

export function setMetadataCache(title, year, data) {
  ensureCacheDir();
  const key = `${title}_${year || "unknown"}`.replace(/[^a-zA-Z0-9_]/g, "_");
  const file = path.join(METADATA_CACHE_DIR, `${key}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Cache hasil scan folder film
export function getFilmsCache() {
  ensureCacheDir();
  if (!fs.existsSync(FILMS_CACHE_FILE)) return null;
  const { timestamp, films } = JSON.parse(fs.readFileSync(FILMS_CACHE_FILE, "utf-8"));
  const expired = Date.now() - timestamp > FILMS_CACHE_TTL;
  if (expired) return null;
  return films;
}

export function setFilmsCache(films) {
  ensureCacheDir();
  fs.writeFileSync(FILMS_CACHE_FILE, JSON.stringify({ timestamp: Date.now(), films }, null, 2));
}