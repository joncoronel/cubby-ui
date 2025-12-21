import { ComponentProps, ReactNode } from "react";
import {
  CodeBlock,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";
import type { BundledLanguage } from "shiki/langs";

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

  if (children && typeof children === "object" && "props" in children) {
    const props = children.props as Record<string, unknown>;

    if (props?.children !== undefined) {
      return extractText(props.children as ReactNode);
    }

    if (typeof props?.value === "string") {
      return props.value;
    }
  }

  return "";
}

export async function MdxPreServer({
  children,
  "data-language": dataLanguage,
  ...props
}: ComponentProps<"pre"> & { "data-language"?: string }) {
  // Extract language from data-language attribute (added by our transformer)
  const language = dataLanguage ?? "tsx";
  const code = extractText(children);

  // If no code found, render as plain pre
  if (!code) {
    return <pre {...props}>{children}</pre>;
  }

  // Server-side highlight
  const highlighted = await highlight(code, language as BundledLanguage);

  return (
    <div className="not-prose my-4">
      <CodeBlock
        code={code}
        language={language}
        initial={highlighted}
        floatingCopy
      >
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>
    </div>
  );
}
