/**
 * Next.js configuration for AuraQA.
 *
 * - `output: "standalone"` enables Docker-optimized builds (self-contained server.js)
 * - Image domains allow OAuth provider avatars
 *
 * @see docs/DEPLOYMENT.md for production configuration
 */

import type { NextConfig } from "next";

// Security response headers — addresses ZAP baseline findings:
// missing X-Content-Type-Options, X-Frame-Options/CSP frame-ancestors
// (anti-clickjacking), Content-Security-Policy, Referrer-Policy,
// Permissions-Policy, and the "Server leaks via X-Powered-By" alert.
//
// CSP is intentionally permissive for inline styles/scripts because Next.js
// emits inline runtime bootstrap and styled-jsx blocks; tightening to
// nonce-only requires a middleware that injects per-request nonces and is
// tracked as future work in docs/SECURITY.md.
//
// `'unsafe-eval'` is NOT included — Next.js 16 (Turbopack) production builds
// do not require runtime eval(). This addresses ZAP alert [10055].
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Mitigates Spectre-class side-channel attacks by isolating cross-origin
  // resources. Uses "credentialless" to avoid breaking same-origin subresources
  // (fonts, images) that don't send CORP headers (ZAP alert 90004).
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
  // Prevents other windows from navigating or scripting this origin
  // (Nuclei http-missing-security-headers:cross-origin-opener-policy).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Restricts which origins may embed this resource — "same-origin"
  // prevents cross-origin inclusion (ZAP full 90004, Nuclei CORP).
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Prevents Adobe Flash / Acrobat from loading data from this domain
  // (Nuclei http-missing-security-headers:x-permitted-cross-domain-policies).
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "img-src 'self' data: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Strip the `X-Powered-By: Next.js` response header — fingerprints the
  // framework version for attackers (ZAP alert 10037).
  poweredByHeader: false,
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
          ...SECURITY_HEADERS,
        ],
      },
    ];
  },
};

export default nextConfig;
