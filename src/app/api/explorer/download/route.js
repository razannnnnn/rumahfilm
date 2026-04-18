import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json({ error: "filePath diperlukan" }, { status: 400 });
    }

    const res = await fetch(
      `${process.env.STB_URL}/api/files/download?filePath=${encodeURIComponent(filePath)}`
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(err, { status: res.status });
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Disposition": res.headers.get("content-disposition") ?? `attachment; filename="${filePath}"`,
        "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
        ...(res.headers.get("content-length") && {
          "Content-Length": res.headers.get("content-length"),
        }),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}