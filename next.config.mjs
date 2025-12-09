import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/:path*",
      },
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
