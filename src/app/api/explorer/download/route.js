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

    const contentDisposition = res.headers.get("content-disposition");
    const contentType = res.headers.get("content-type");
    const contentLength = res.headers.get("content-length");

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Disposition": contentDisposition ?? "attachment",
        "Content-Type": contentType ?? "application/octet-stream",
        ...(contentLength && { "Content-Length": contentLength }),
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}