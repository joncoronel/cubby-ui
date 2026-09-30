"use client";

import type { ReactElement } from "react";
import { componentAnatomy } from "@/app/components/_generated/registry";
import {
  CodeBlock,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";

interface ComponentUsageProps {
  component: string;
  highlightedImports?: ReactElement;
  highlightedAnatomy?: ReactElement;
}

/**
 * A component's imports and anatomy: two cards, since they're copied apart
 * (the import to the top of a file, the markup where it's used), in one
 * tray that holds them together as one usage.
 */
export function ComponentUsage({
  component,
  highlightedImports,
  highlightedAnatomy,
}: ComponentUsageProps) {
  const anatomy = componentAnatomy[component as keyof typeof componentAnatomy];

  if (!anatomy) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-md border p-4">
        <p className="text-destructive text-sm">
          Component anatomy not found: <code>{component}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="docs-code-tray not-prose my-6 flex w-full max-w-full min-w-0 flex-col gap-1">
      <CodeBlock
        code={anatomy.imports.trimEnd()}
        language="tsx"
        initial={highlightedImports}
        floatingCopy
      >
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>
      <CodeBlock
        code={anatomy.anatomy.trimEnd()}
        language="tsx"
        initial={highlightedAnatomy}
        floatingCopy
      >
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>
    </div>
  );
}
