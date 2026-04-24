"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body style={{ background: "#111113", color: "#f0f0f0", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "360px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
              Terjadi Error Fatal
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "24px" }}>
              Aplikasi mengalami error yang tidak terduga.
            </p>
            <button
              onClick={reset}
              style={{
                background: "rgba(134,239,172,0.2)",
                color: "#86efac",
                border: "1px solid rgba(134,239,172,0.4)",
                padding: "10px 20px",
                borderRadius: "12px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Coba lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}