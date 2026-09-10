"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", background: "#f6efe6", color: "#1c1410", margin: 0 }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1>POS could not load</h1>
            <p>Live data comes from MongoDB Atlas. Confirm Cluster0 is resumed, then retry.</p>
            <button type="button" onClick={reset} style={{ padding: "12px 20px", borderRadius: 16 }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
