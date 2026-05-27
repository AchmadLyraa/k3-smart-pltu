import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "K3 SMART",
    short_name: "K3 SMART",
    description: "Platform pembelajaran keselamatan kerja",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#E74C3C",
    lang: "id",
    categories: ["safety", "work", "materials", "smart"],
    icons: [
      {
        src: "/manifest/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/manifest/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/manifest/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/manifest/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/manifest/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/manifest/favicon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/manifest/android-chrome-512x512.png",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/manifest/android-chrome-512x512.png",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "/manifest/android-chrome-512x512.png",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/manifest/login-desktop-ss.png",
        sizes: "1359x636",
        type: "image/png",
        form_factor: "wide",
      },
      // Opsional: Screenshot untuk mobile
      {
        src: "/manifest/login-mobile-ss.jpeg",
        sizes: "720x1356",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
