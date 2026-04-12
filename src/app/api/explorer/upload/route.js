import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import config from "../../../../../config";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });

    const filename = file.name;
    const filePath = path.join(config.filmsPath, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
