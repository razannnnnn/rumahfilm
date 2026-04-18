export async function GET(request, { params }) {
  const { id } = await params;
  const stbUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
  
  const res = await fetch(`${stbUrl}/api/subtitle/${id}`);
  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Subtitle tidak ditemukan" }), { status: 404 });
  }
  const text = await res.text();
  return new Response(text, {
    headers: { "Content-Type": "text/vtt", "Cache-Control": "public, max-age=86400" },
  });
}