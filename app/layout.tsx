import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FanRoute",
  description: "Find World Cup watch parties and fan meetups by host city.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, Arial, sans-serif" }}>
        <header
          style={{
            borderBottom: "1px solid #ddd",
            padding: "14px 18px",
          }}
        >
          <nav
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Link href="/" style={{ fontWeight: 900, textDecoration: "none" }}>
              Fanbase 2026
            </Link>

            <div style={{ display: "flex", gap: 14 }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                Home
              </Link>
              <Link href="/submit" style={{ textDecoration: "none" }}>
                Submit
              </Link>
            </div>
          </nav>
        </header>

        <div style={{ maxWidth: 900, margin: "0 auto" }}>{children}</div>
      </body>
    </html>
  );
}
