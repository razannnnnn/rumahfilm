import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.STB_URL}/api/files`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}