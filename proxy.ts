import { NextRequest, NextResponse } from "next/server";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import { opServer } from "@/lib/openpanel";

const { rewrite: rewriteLLM } = rewritePath("/docs/*path", "/llms.mdx/*path");

export const config = {
  matcher: [
    "/r/:path*.json", // Registry component installs
    {
      source: "/docs/:path*",
      has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
    },
  ],
};

export default function proxy(
  request: NextRequest,
  event: { waitUntil: (promise: Promise<unknown>) => void },
) {
  const { pathname } = request.nextUrl;

  // Track registry component installs (non-blocking)
  if (pathname.startsWith("/r/") && pathname.endsWith(".json")) {
    const componentName = pathname.replace("/r/", "").replace(".json", "");

    event.waitUntil(
      opServer.track("component_install", {
        component: componentName,
        userAgent: request.headers.get("user-agent") || "unknown",
      }),
    );
  }

  // Existing Fumadocs LLM rewrite logic
  if (isMarkdownPreferred(request)) {
    const result = rewriteLLM(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }
  }

  return NextResponse.next();
}

// Pseudo-code
// const dedupeKey = `install:${ip}:${componentName}`;
// const exists = await kv.get(dedupeKey);

// if (!exists) {
//   await kv.set(dedupeKey, "1", { ex: 30 }); // 30 second TTL
//   event.waitUntil(opServer.track("component_install", {...}));
// }
