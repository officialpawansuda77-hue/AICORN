import type { NextConfig } from "next";
import crypto from "crypto";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    // Use a per-build nonce would be ideal, but Next.js injects inline
    // styles itself so 'unsafe-inline' for style-src is required.
    // For scripts we tighten to strict-dynamic where possible.
    const nonce = crypto.randomBytes(16).toString("base64");
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'nonce-${nonce}' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https://drive.google.com https://drive.usercontent.google.com https://*.googleusercontent.com https://*.supabase.co https://*.supabase.in",
              "frame-src 'self' https://drive.google.com https://docs.google.com",
              "connect-src 'self' https: wss:",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },
};

export default nextConfig;
