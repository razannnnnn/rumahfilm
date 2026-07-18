export async function GET(request, { params }) {
  const { id } = await params;
  const serverUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  const range = request.headers.get("range");
  
  const res = await fetch(`${serverUrl}/api/stream/${id}`, {
    headers: range ? { range } : {},
  });

  const headers = new Headers();
  headers.set("Content-Type", res.headers.get("Content-Type") || "video/mp4");
  headers.set("Accept-Ranges", "bytes");

  // Only forward these headers if they actually exist — empty strings
  // confuse the browser's video decoder and cause duration to be NaN/Infinity
  const contentRange = res.headers.get("Content-Range");
  if (contentRange) headers.set("Content-Range", contentRange);

  const contentLength = res.headers.get("Content-Length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(res.body, {
    status: res.status,
    headers,
  });
}