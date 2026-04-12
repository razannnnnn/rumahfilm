import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import config from "../../../../../config";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) return NextResponse.json({ error: "Nama file diperlukan" }, { status: 400 });

  const filePath = path.join(config.filmsPath, name);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

  const buffer = fs.readFileSync(filePath);
  return new Response(buffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
      "Content-Type": "application/octet-stream",
    },
  });
}