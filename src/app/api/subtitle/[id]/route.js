export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const serverUrl = process.env.STB_URL || "http://localhost:4000";

    const res = await fetch(`${serverUrl}/api/subtitle/${id}`, { cache: "no-store" });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Subtitle tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const text = await res.text();
    return new Response(text, {
      headers: {
        "Content-Type": "text/vtt",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}