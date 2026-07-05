export async function GET(request, { params }) {
  const { id } = await params;
  const serverUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  const range = request.headers.get("range");
  
  const res = await fetch(`${serverUrl}/api/stream/${id}`, {
    headers: range ? { range } : {},
  });

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "video/mp4",
      "Content-Range": res.headers.get("Content-Range") || "",
      "Accept-Ranges": "bytes",
      "Content-Length": res.headers.get("Content-Length") || "",
    },
  });
}