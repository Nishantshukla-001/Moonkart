"use client";

// This is the only error boundary that can catch a failure in the root
// layout itself (Providers/SiteChrome/font setup) — a regular app/error.tsx
// can't, since it renders *inside* the layout it would need to replace.
// Next.js requires this file to render its own <html>/<body>, and it must
// stay self-contained (no Container/EmptyState/font imports) since those
// come from the very layout that may have just failed.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#fdf2f5",
          color: "#2f2f2f",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
        <p style={{ fontSize: "15px", color: "#5b5b5b", maxWidth: "28rem", margin: 0 }}>
          An unexpected error occurred loading MoonKart. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "8px",
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: "#efc6d1",
            color: "#2f2f2f",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
