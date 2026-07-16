import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Old bookmarks: pages moved from /firms/* to /companies/*.
    return [{ source: "/firms/:path*", destination: "/companies/:path*", permanent: true }];
  }
};

export default nextConfig;
