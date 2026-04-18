import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { names } = await request.json();
    if (!names?.length) {
      return NextResponse.json({ error: "names diperlukan" }, { status: 400 });
    }

    const stbUrl = process.env.STB_URL;
    let deleted = 0;
    const errors = [];

    // Hapus satu per satu karena STB terima single filePath
    await Promise.all(
      names.map(async (name) => {
        const res = await fetch(`${stbUrl}/api/files/delete`, {
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