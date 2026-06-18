import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RetroNet Arcade",
    short_name: "RetroNet",
    description: "A neon offline-ready browser arcade for classic Flash games powered by Ruffle.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#07070f",
    theme_color: "#ff2bd6",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icons/retronet-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/retronet-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/retronet-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
