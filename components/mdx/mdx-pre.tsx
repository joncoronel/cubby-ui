"use client";

import { ComponentProps, ReactNode } from "react";
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

// Helper to extract text from React children recursively
function extractText(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }

  if (typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(extractText).join("");
  }

  if (children && typeof children === "object") {
    // Handle React elements with props
    if ("props" in children) {
      const props = children.props as any;

      // Extract text from children prop
      if (props?.children !== undefined) {
        return extractText(props.children);
      }

      // Some elements might have text in other props
      if (typeof props?.value === "string") {
        return props.value;
      }
    }
  }

  return "";
}

export function MdxPre({ children, ...props }: ComponentProps<"pre">) {
  // fumadocs-ui rehypeCode adds these props
  const rawCode = (props as any)["data-code"]; // Raw unprocessed code
  const language = (props as any)["data-language"]; // Language identifier
  const icon = (props as any).icon;
  const title = (props as any).title;

  console.log("MdxPre - ALL PROPS:", JSON.stringify(Object.keys(props), null, 2));
  console.log("MdxPre - data-code:", rawCode);
  console.log("MdxPre - data-language:", language);
  console.log("MdxPre - title:", title);
  console.log("MdxPre - icon exists:", !!icon);

  // If no icon prop, this might not be from rehypeCode, fallback to default
  if (!icon) {
    return <pre {...props}>{children}</pre>;
  }

  // Try to use raw code from data attribute first
  const code = rawCode || extractText(children);
  const lang = language || title || "tsx";

  console.log("MdxPre - FINAL code length:", code.length);
  console.log("MdxPre - FINAL language:", lang);

  if (!code) {
    return <pre {...props}>{children}</pre>;
  }

  // Use our CodeBlock - it will re-highlight on the client
  return (
    <CodeBlock code={code} language={lang}>
      <CodeBlockHeader />
      <CodeBlockPre>
        <CodeBlockCode />
      </CodeBlockPre>
    </CodeBlock>
  );
}
