import { NextResponse } from "next/server";
import { appendRequest, getRequests } from "@/lib/googleSheets";

// POST — user kirim request film
export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, judul } = body;

    if (!nama || !judul) {
      return NextResponse.json(
        { error: "Nama dan judul film wajib diisi" },
        { status: 400 }
      );
    }

    if (nama.length > 100 || judul.length > 200) {
      return NextResponse.json(
        { error: "Input terlalu panjang" },
        { status: 400 }
      );
    }

    await appendRequest({ nama, judul });

    return NextResponse.json({ success: true, message: "Request berhasil dikirim!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — admin ambil semua request
export async function GET() {
  try {
    const requests = await getRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}