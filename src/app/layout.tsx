import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const ui = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Fast and Slow Restaurant POS",
    template: "%s · Fast and Slow Restaurant",
  },
  description: "Fast and Slow Restaurant point of sale, inventory, and daily sales.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${ui.variable} ${display.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
