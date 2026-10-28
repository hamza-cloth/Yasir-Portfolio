"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/monitoring";

// Last resort when the root layout itself fails: plain HTML and inline styles, no dependencies.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => reportError(error, { boundary: "global" }), [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          background: "#f5f6f8",
          color: "#0e1220",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <title>Something went wrong · Yasir Abdullah</title>
        <main>
          <h1 style={{ fontSize: "2rem", margin: "0 0 12px" }}>Something went wrong.</h1>
          <p style={{ color: "#5d6475", margin: "0 0 24px" }}>
            The site could not load. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              minHeight: 48,
              padding: "0 24px",
              border: 0,
              borderRadius: 999,
              background: "#2b59ff",
              color: "#fff",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
