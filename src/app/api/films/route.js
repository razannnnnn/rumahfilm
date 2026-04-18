import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
    const res = await fetch(`${stbUrl}/api/films`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}