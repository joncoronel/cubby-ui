"use client";

import * as React from "react";
import type { ReactElement } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SourceCodeIcon } from "@hugeicons/core-free-icons";
import { componentMap } from "@/app/components/_generated/registry";
import {
  CodeBlock,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { MorphText } from "@/components/docs/morph-text";
import { cn } from "@/lib/utils";

interface ComponentPreviewProps {
  code?: string;
  language?: string;
  className?: string;
  example?: string;
  initialHighlighted?: ReactElement;
  serverRenderedExample?: ReactElement;
}

const TOOL =
  "docs-stage-tool text-muted-foreground hover:text-foreground hover:bg-surface-hover focus-visible:outline-ring/50 flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium outline-none focus-visible:outline-2";

export function ComponentPreview({
  code,
  language = "tsx",
  className,
  example,
  initialHighlighted,
  serverRenderedExample,
}: ComponentPreviewProps) {
  const codeId = React.useId();
  const [showCode, setShowCode] = React.useState(false);

  // Look up the example on the client, unless the server already rendered it
  // (async server-component examples).
  const ExampleComponent = example
    ? componentMap[example as keyof typeof componentMap]
    : null;
  const exampleNode =
    serverRenderedExample || (ExampleComponent && <ExampleComponent />);

  return (
    <figure
      data-slot="preview"
      className={cn("docs-stage-wrap not-prose", className)}
    >
      <div className="docs-stage">
        <div className="docs-stage-tools">
          {code && (
            <button
              type="button"
              className={TOOL}
              aria-expanded={showCode}
              aria-controls={codeId}
              onClick={() => setShowCode((s) => !s)}
            >
              <HugeiconsIcon
                icon={SourceCodeIcon}
                strokeWidth={2}
                className="size-3.5"
              />
              <MorphText feedback>{showCode ? "Hide code" : "Code"}</MorphText>
            </button>
          )}
        </div>

        <div className="docs-stage-canvas">{exampleNode}</div>
      </div>

      {/* Code appears in place, no height animation: revealing a long block
          by animating layout is slow on heavy pages. */}
      {code && (
        <div id={codeId} hidden={!showCode} className="docs-code-reveal">
          <CodeBlock
            code={code}
            language={language}
            floatingCopy
            initial={initialHighlighted}
            className="mt-2"
          >
            <CodeBlockPre>
              <CodeBlockCode />
            </CodeBlockPre>
          </CodeBlock>
        </div>
      )}
    </figure>
  );
}
