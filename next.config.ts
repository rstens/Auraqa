/**
 * Next.js configuration for AuraQA.
 *
 * - `output: "standalone"` enables Docker-optimized builds (self-contained server.js)
 * - Image domains allow OAuth provider avatars
 *
 * @see docs/DEPLOYMENT.md for production configuration
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        // Allow bfcache on all pages by replacing no-store with no-cache.
        // Pages are still revalidated on navigation but can be restored
        // instantly on back/forward without a full reload.
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
