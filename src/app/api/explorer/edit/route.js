import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadPath = searchParams.get("path");

    const formData = await request.formData();

    const stbUrl = new URL(`${process.env.STB_URL}/api/files/upload`);
    if (uploadPath) stbUrl.searchParams.set("path", uploadPath);

    const res = await fetch(stbUrl.toString(), {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const config = {
  api: { bodyParser: false },
};