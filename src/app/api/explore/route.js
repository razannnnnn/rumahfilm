import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import config from "../../../../config";

const BASE_PATH = config.filmsPath;

export async function GET() {
  try {
    const files = fs.readdirSync(BASE_PATH).map((filename) => {
      const filePath = path.join(BASE_PATH, filename);
      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const sizeBytes = stats.size;
      const sizeFormatted = sizeBytes > 1024 * 1024 * 1024
        ? (sizeBytes / 1024 / 1024 / 1024).toFixed(2) + " GB"
        : sizeBytes > 1024 * 1024
        ? (sizeBytes / 1024 / 1024).toFixed(1) + " MB"
        : (sizeBytes / 1024).toFixed(1) + " KB";

      return {
        name: filename,
        ext,
        size: sizeFormatted,
        modified: stats.mtime.toISOString(),
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Rename
export async function PATCH(request) {
  try {
    const { oldName, newName } = await request.json();
    if (!oldName || !newName) return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });

    const oldPath = path.join(BASE_PATH, oldName);
    const newPath = path.join(BASE_PATH, newName);

    if (!fs.existsSync(oldPath)) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
    if (fs.existsSync(newPath)) return NextResponse.json({ error: "Nama sudah dipakai" }, { status: 409 });

    fs.renameSync(oldPath, newPath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete
export async function DELETE(request) {
  try {
    const { names } = await request.json();
    if (!names || names.length === 0) return NextResponse.json({ error: "Tidak ada file dipilih" }, { status: 400 });

    for (const name of names) {
      const filePath = path.join(BASE_PATH, name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true, deleted: names.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}