export async function GET(request, { params }) {
  const { id } = await params;
  const serverUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";

  try {
    const res = await fetch(`${serverUrl}/api/stream/${id}/info`, {
      cache: "force-cache",
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ needsTranscode: false, audioCodec: "unknown" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ needsTranscode: false, audioCodec: "unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
