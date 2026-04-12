import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import config from "../../../../../config";

const execAsync = promisify(exec);

function srtToVtt(srt) {
  let vtt = "WEBVTT\n\n";
  const blocks = srt.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    // Skip nomor urut
    let i = 0;
    if (/^\d+$/.test(lines[0].trim())) i = 1;

    // Timestamp — ganti koma jadi titik
    const timestamp = lines[i]?.replace(/,/g, ".");
    if (!timestamp || !timestamp.includes("-->")) continue;

    // Teks subtitle
    const text = lines.slice(i + 1).join("\n");
    vtt += `${timestamp}\n${text}\n\n`;
  }

  return vtt;
}

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const filename = Buffer.from(id, "base64url").toString("utf-8");
    const videoPath = path.join(config.filmsPath, filename);

    if (!fs.existsSync(videoPath)) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();

    // Kalau bukan MKV, tidak ada subtitle embedded
    if (ext !== ".mkv") {
      return NextResponse.json({ error: "Bukan file MKV" }, { status: 404 });
    }

    // Cek apakah sudah ada cache .srt
    const srtPath = videoPath.replace(/\.mkv$/i, ".srt");
    const vttPath = videoPath.replace(/\.mkv$/i, ".vtt");

    // Kalau VTT sudah ada, langsung serve
    if (fs.existsSync(vttPath)) {
      const vtt = fs.readFileSync(vttPath, "utf-8");
      return new Response(vtt, {
        headers: {
          "Content-Type": "text/vtt",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Kalau VTT sudah ada, langsung serve
if (fs.existsSync(vttPath)) {
  const vtt = fs.readFileSync(vttPath, "utf-8");
  return new Response(vtt, {
    headers: {
      "Content-Type": "text/vtt",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

// ← TAMBAHKAN INI: Kalau SRT sudah ada, convert langsung tanpa ffmpeg
if (fs.existsSync(srtPath)) {
  const srtContent = fs.readFileSync(srtPath, "utf-8");
  const vttContent = srtToVtt(srtContent);
  fs.writeFileSync(vttPath, vttContent, "utf-8");
  return new Response(vttContent, {
    headers: {
      "Content-Type": "text/vtt",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

    // Ekstrak subtitle dari MKV pakai ffmpeg
    // Coba index 3 (SRT) dulu, kalau gagal coba index 2 (ASS)
    let srtContent = null;

    try {
      await execAsync(
        `ffmpeg -i "${videoPath}" -map 0:3 -f srt "${srtPath}" -y`
      );
      if (fs.existsSync(srtPath)) {
        srtContent = fs.readFileSync(srtPath, "utf-8");
      }
    } catch {
      // Coba track subtitle pertama
      try {
        await execAsync(
          `ffmpeg -i "${videoPath}" -map 0:s:0 -f srt "${srtPath}" -y`
        );
        if (fs.existsSync(srtPath)) {
          srtContent = fs.readFileSync(srtPath, "utf-8");
        }
      } catch {
        return NextResponse.json({ error: "Subtitle tidak ditemukan" }, { status: 404 });
      }
    }

    if (!srtContent) {
      return NextResponse.json({ error: "Gagal ekstrak subtitle" }, { status: 500 });
    }

    // Convert SRT → VTT
    const vttContent = srtToVtt(srtContent);

    // Cache VTT ke disk
    fs.writeFileSync(vttPath, vttContent, "utf-8");

    // Hapus SRT sementara
    if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);

    return new Response(vttContent, {
      headers: {
        "Content-Type": "text/vtt",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}