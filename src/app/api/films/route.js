import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import config from "../../../../config";
import { getFilmsCache, setFilmsCache } from "@/lib/cache";

function parseFilmName(filename) {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  const match = name.match(/^(.+?)\s*\((\d{4})\)$/);
  if (match) {
    return { title: match[1].trim(), year: match[2] };
  }
  return { title: name.trim(), year: null };
}

export async function GET() {
  try {
    // Cek cache dulu
    const cached = getFilmsCache();
    if (cached) {
      return NextResponse.json({ films: cached, fromCache: true });
    }

    const filmsDir = config.filmsPath;

    if (!fs.existsSync(filmsDir)) {
      return NextResponse.json(
        { error: "Folder film tidak ditemukan", path: filmsDir },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(filmsDir);

    const films = files
      .filter((file) =>
        config.supportedFormats.includes(path.extname(file).toLowerCase())
      )
      .map((file) => {
        const { title, year } = parseFilmName(file);
        const filePath = path.join(filmsDir, file);
        const stats = fs.statSync(filePath);
        const sizeGB = (stats.size / (1024 * 1024 * 1024)).toFixed(2);

        return {
          id: Buffer.from(file).toString("base64url"),
          filename: file,
          title,
          year,
          sizeGB,
          ext: path.extname(file).toLowerCase(),
        };
      });

    // Simpan ke cache
    setFilmsCache(films);

    return NextResponse.json({ films, fromCache: false });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}