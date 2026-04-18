import { NextResponse } from "next/server";

export async function PATCH(request) {
  try {
    const { oldName, newName } = await request.json();
    const res = await fetch(`${process.env.STB_URL}/api/files/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPath: oldName, newName }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}