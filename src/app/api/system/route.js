import { NextResponse } from "next/server";

export async function GET() {
  const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  const res = await fetch(`${stbUrl}/api/system`, { cache: "no-store" });
  return NextResponse.json(await res.json());
}