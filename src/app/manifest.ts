import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ledger — Expense & Asset Tracker",
    short_name: "Ledger",
    description: "Personal expense and asset tracking, built for mobile.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0E10",
    theme_color: "#0B0E10",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
