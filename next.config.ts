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
};

export default nextConfig;
