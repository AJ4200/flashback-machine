import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FlashBack Machine",
    short_name: "FlashBack",
    description: "A neon offline-ready browser arcade for classic Flash, DOS, NES, MAME, and Sega games.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#07070f",
    theme_color: "#ff2bd6",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icons/flashback-machine-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/flashback-machine-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/flashback-machine-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
