import { NextRequest, NextResponse } from "next/server";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";

const { rewrite: rewriteLLM } = rewritePath(
  "/docs{/*path}",
  "/llms.mdx/docs{/*path}",
);
const { rewrite: rewriteMd } = rewritePath(
  "/docs{/*path}.md",
  "/llms.mdx/docs{/*path}",
);

export const config = {
  matcher: [
    "/docs/:path*.md", // Direct .md URLs (any Accept header)
    {
      source: "/docs/:path*",
      has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
    },
  ],
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip .md extension and rewrite to the LLM route (handles all clients).
  // Must run before the Accept-based rewrite so the .md suffix doesn't leak
  // into the route handler slug.
  const mdResult = rewriteMd(pathname);
  if (mdResult) {
    return NextResponse.rewrite(new URL(mdResult, request.nextUrl));
  }

  // Content negotiation: serve markdown when the client prefers it.
  if (isMarkdownPreferred(request)) {
    const result = rewriteLLM(pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return NextResponse.next();
}
