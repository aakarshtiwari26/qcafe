import type { NextConfig } from "next";

const imagekitHostname = (() => {
  try {
    return process.env.IMAGEKIT_URL_ENDPOINT ? new URL(process.env.IMAGEKIT_URL_ENDPOINT).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(imagekitHostname ? [{ protocol: "https" as const, hostname: imagekitHostname }] : []),
      { protocol: "https" as const, hostname: "ik.imagekit.io" },
    ],
  },
};

export default nextConfig;
