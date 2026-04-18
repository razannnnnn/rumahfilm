import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.STB_URL}/api/files/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}