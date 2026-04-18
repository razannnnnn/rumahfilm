import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.STB_URL}/api/resource`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();

    // Normalize data dari STB ke format yang dipakai frontend
    return NextResponse.json({
      cpu: parseFloat(data.cpu?.percent ?? 0),
      ram: {
        used: data.ram?.used ?? 0,
        total: data.ram?.total ?? 0,
        free: data.ram?.free ?? 0,
        percent: parseFloat(data.ram?.percent ?? 0),
      },
      disk: {
        used: data.disk?.used ?? 0,
        total: data.disk?.total ?? 0,
        free: data.disk?.free ?? 0,
        percent: parseFloat(data.disk?.percent ?? 0),
      },
      uptime: data.uptime,
      hostname: data.hostname,
      platform: data.platform,
      cpuCores: data.cpu?.cores ?? 0,
      cpuModel: data.cpu?.model ?? "Unknown",
      updatedAt: data.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}