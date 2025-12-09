import type { ReactNode } from "react";
import { ComponentPreview } from "./component-preview";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";
import type { BundledLanguage } from "shiki/langs";
import { exampleRegistry } from "@/app/components/_generated/registry";

interface ComponentPreviewServerProps {
  code?: string;
  language?: string;
  className?: string;
  // Props for auto-fetching code from registry
  component?: string;
  example?: string;
}

// Server component wrapper - handles both sync and async examples
export async function ComponentPreviewServer({
  code,
  language = "tsx",
  className = "",
  component,
  example,
}: ComponentPreviewServerProps) {
  // Auto-fetch code from registry if component and example are provided
  let sourceCode = code;

  if (component && example && !code) {
    const examples = exampleRegistry[component as keyof typeof exampleRegistry];
    const exampleData = examples?.find((e) => e.importPath === example);
    if (exampleData) {
      sourceCode = exampleData.source;
    }
  }

  // Special handling for async server component examples
  // These need to be rendered on the server, not in the client component
  if (example === "code-block-server-highlight") {
    const ServerExample = (
      await import(
        "@/registry/examples/code-block/code-block-server-highlight"
      )
    ).default;

    const highlightedCode = sourceCode
      ? await highlight(sourceCode, language as BundledLanguage)
      : undefined;

    return (
      <ComponentPreview
        code={sourceCode}
        language={language}
        className={className}
        initialHighlighted={highlightedCode}
        serverRenderedExample={<ServerExample />}
      />
    );
  }

  // If we have source code, await highlighting before passing to client
  if (sourceCode) {
    const highlightedCode = await highlight(
      sourceCode,
      language as BundledLanguage,
    );

    return (
      <ComponentPreview
        code={sourceCode}
        language={language}
        className={className}
        initialHighlighted={highlightedCode}
        example={example}
      />
    );
  }

  // No code, just render preview
  return (
    <ComponentPreview
      language={language}
      className={className}
      example={example}
    />
  );
}
