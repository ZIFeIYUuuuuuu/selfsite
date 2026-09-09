import type { NextConfig } from "next";

function normalizeOrigin(origin: string | undefined): string {
  const fallback = "http://localhost:8000";
  const source = origin?.trim() || fallback;
  return source.replace(/\/+$/, "");
}

const backendOrigin = normalizeOrigin(process.env.BACKEND_ORIGIN);
const isDev = process.env.NODE_ENV !== "production";
const hasConfiguredBackendOrigin = Boolean(process.env.BACKEND_ORIGIN?.trim());
const longLivedCacheHeader = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable"
};

function buildContentSecurityPolicy(): string {
  const scriptSrc = ["'self'", "'unsafe-inline'"];
  const connectSrc = ["'self'"];
  const styleSrc = ["'self'", "'unsafe-inline'"];

  if (isDev || hasConfiguredBackendOrigin) {
    connectSrc.push(backendOrigin);
  }

  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
    connectSrc.push("ws:", "wss:");
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "img-src 'self' data: blob: https://avatars.githubusercontent.com",
    "media-src 'self' blob:",
    "font-src 'self' data:",
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join("; ");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [longLivedCacheHeader]
      },
      {
        source: "/contact/:path*",
        headers: [longLivedCacheHeader]
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy()
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
