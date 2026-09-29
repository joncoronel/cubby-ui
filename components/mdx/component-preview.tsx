"use client";

import type { ReactElement } from "react";
import { componentMap } from "@/app/components/_generated/registry";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";
import { CodePeek } from "./code-peek";

interface ComponentPreviewProps {
  code?: string;
  language?: string;
  className?: string;
  example?: string;
  initialHighlighted?: ReactElement;
  serverRenderedExample?: ReactElement;
}

/**
 * An example and its code as one object: a tray holding the live example
 * on a card at the top, and the code beneath it on the tray itself (a peek
 * when it's long, see `CodePeek`).
 */
export function ComponentPreview({
  code,
  language = "tsx",
  className,
  example,
  initialHighlighted,
  serverRenderedExample,
}: ComponentPreviewProps) {
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
      className={cn(
        "docs-stage-wrap not-prose",
        code && ["docs-example", solidSurface(3, 1), "bg-muted"],
        className,
      )}
    >
      <div className="docs-stage">
        <div className="docs-stage-canvas">{exampleNode}</div>
      </div>

      {code && (
        <CodePeek
          code={code}
          language={language}
          initial={initialHighlighted}
        />
      )}
    </figure>
  );
}
