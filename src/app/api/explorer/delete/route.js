import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { names } = await request.json();
    if (!names?.length) {
      return NextResponse.json({ error: "names diperlukan" }, { status: 400 });
    }

    const serverUrl = process.env.NEXT_PUBLIC_STB_URL || "http://localhost:4000";
    let deleted = 0;
    const errors = [];

    // Hapus satu per satu karena server terima single filePath
    await Promise.all(
      names.map(async (name) => {
        const res = await fetch(`${serverUrl}/api/files/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: name }),
        });
        const data = await res.json();
        if (data.success) deleted++;
        else errors.push(data.error);
      })
    );

    return NextResponse.json({
      success: true,
      deleted,
      ...(errors.length && { errors }),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}