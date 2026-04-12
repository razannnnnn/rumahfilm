import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import config from "../../../../../config";

function srtToVtt(srt) {
  srt = srt.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  let vtt = "WEBVTT\n\n";
  const blocks = srt.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    let i = 0;
    if (/^\d+$/.test(lines[0].trim())) i = 1;

    const timestamp = lines[i]?.replace(/,/g, ".");
    if (!timestamp || !timestamp.includes("-->")) continue;

    const text = lines.slice(i + 1).join("\n");
    vtt += `${timestamp}\n${text}\n\n`;
  }

  return vtt;
}

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const filename = Buffer.from(id, "base64url").toString("utf-8");
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    const srtPath = path.join(config.filmsPath, `${baseName}.srt`);
    const vttPath = path.join(config.filmsPath, `${baseName}.vtt`);

    // Kalau VTT cache sudah ada, langsung serve
    if (fs.existsSync(vttPath)) {
      const vtt = fs.readFileSync(vttPath, "utf-8");
      return new Response(vtt, {
        headers: { "Content-Type": "text/vtt", "Cache-Control": "public, max-age=86400" },
      });
    }

    // Kalau SRT ada, convert ke VTT lalu serve
    if (fs.existsSync(srtPath)) {
      const srtContent = fs.readFileSync(srtPath, "utf-8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const vttContent = srtToVtt(srtContent);
      fs.writeFileSync(vttPath, vttContent, "utf-8");
      return new Response(vttContent, {
        headers: { "Content-Type": "text/vtt", "Cache-Control": "public, max-age=86400" },
      });
    }

    // Tidak ada subtitle
    return NextResponse.json({ error: "Subtitle tidak ditemukan" }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}