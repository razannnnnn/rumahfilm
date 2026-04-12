import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import config from "../../../../../config";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const filename = Buffer.from(id, "base64url").toString("utf-8");
    const filePath = path.join(config.filmsPath, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get("range");

    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap = {
      ".mp4": "video/mp4",
      ".mkv": "video/x-matroska",
      ".avi": "video/x-msvideo",
      ".mov": "video/quicktime",
      ".webm": "video/webm",
      ".m4v": "video/mp4",
    };
    const contentType = contentTypeMap[ext] || "video/mp4";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = fs.createReadStream(filePath, { start, end });

      return new Response(stream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
        },
      });
    }

    const stream = fs.createReadStream(filePath);
    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}