import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config/site";

/**
 * Basic web manifest — drives "Add to Home Screen" branding today. Full
 * PWA (service worker, offline caching, install prompts) is intentionally
 * out of scope for now; see PROJECT future-features notes.
 */
export default function manifest(): MetadataRoute.Manifest {
  const site = getSiteConfig();

  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: site.logoUrl, sizes: "192x192", type: "image/webp" },
      { src: site.logoUrl, sizes: "512x512", type: "image/webp" },
    ],
  };
}
