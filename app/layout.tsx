import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "K3-SMART - Keselamatan Kerja Learning Platform",
  description:
    "Platform pembelajaran keselamatan kerja interaktif dengan video, infografis, dan kuis",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload font kritis untuk halaman login */}
        <link
          rel="preload"
          href="/fonts/Buckin-Regular%20Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Buckin-Bold%20Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        {/* Preload gambar hero login */}
        <link
          rel="preload"
          href="/images/hero-login.png"
          as="image"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
