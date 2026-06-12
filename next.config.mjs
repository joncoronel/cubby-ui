import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@hugeicons/react", "@hugeicons/core-free-icons"],
  },
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ['192.168.1.128'],
  async headers() {
    return [
      {
        source: "/r/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/op/analytics/:path*",
        destination: "https://api.openpanel.dev/:path*",
      },
      {
        source: "/op1.js",
        destination: "https://openpanel.dev/op1.js",
      },
    ];
  },
};

export default withMDX(config);
