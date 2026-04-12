import type { NextConfig } from "next";

function normalizeOrigin(origin: string | undefined): string {
  const fallback = "http://localhost:8000";
  const source = origin?.trim() || fallback;
  return source.replace(/\/+$/, "");
}

const backendOrigin = normalizeOrigin(process.env.BACKEND_ORIGIN);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
