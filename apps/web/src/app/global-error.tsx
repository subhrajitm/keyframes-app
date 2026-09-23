"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Something went wrong</p>
          <button
            onClick={reset}
            style={{ padding: "8px 20px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
