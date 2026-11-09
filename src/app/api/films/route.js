import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serverUrl = process.env.STB_URL || "http://localhost:4000";
    const res = await fetch(`${serverUrl}/api/films`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Server film tidak merespons (${res.status})` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}