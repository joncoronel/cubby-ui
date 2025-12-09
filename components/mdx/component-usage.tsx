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

  const importsCode = anatomy.imports;
  const anatomyCode = anatomy.anatomy;

  return (
    <div className="not-prose my-6 w-full max-w-full min-w-0 space-y-4">
      <CodeBlock
        code={importsCode}
        language="tsx"
        initial={highlightedImports}
        floatingCopy
      >
        <CodeBlockPre>
          <CodeBlockCode />
        </CodeBlockPre>
      </CodeBlock>

      <CodeBlock
        code={anatomyCode}
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
