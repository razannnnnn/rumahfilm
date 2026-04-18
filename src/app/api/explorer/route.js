import { NextResponse } from "next/server";

const stbUrl = () => process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";

export async function GET() {
  const res = await fetch(`${stbUrl()}/api/explorer`);
  return NextResponse.json(await res.json());
}

export async function PATCH(request) {
  const body = await request.json();
  const res = await fetch(`${stbUrl()}/api/explorer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}

export async function DELETE(request) {
  const body = await request.json();
  const res = await fetch(`${stbUrl()}/api/explorer`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}