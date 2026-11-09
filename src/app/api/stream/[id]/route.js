export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const serverUrl = process.env.STB_URL || "http://localhost:4000";
    const range = request.headers.get("range");

    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const backendUrl = `${serverUrl}/api/stream/${id}${searchParams ? `?${searchParams}` : ""}`;

    const res = await fetch(backendUrl, {
      headers: range ? { range } : {},
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Stream gagal: ${res.status}` }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") || "video/mp4");
    headers.set("Accept-Ranges", "bytes");

    // Only forward these headers if they actually exist. Empty strings
    // confuse the browser's video decoder and cause duration to be NaN/Infinity.
    const contentRange = res.headers.get("Content-Range");
    if (contentRange) headers.set("Content-Range", contentRange);

    const contentLength = res.headers.get("Content-Length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(res.body, {
      status: res.status,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}