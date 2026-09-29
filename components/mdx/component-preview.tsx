"use client";

import * as React from "react";
import type { ReactElement } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { componentMap } from "@/app/components/_generated/registry";
import {
  CodeBlock,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { CopyButton } from "@/registry/default/copy-button/copy-button";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";

interface ComponentPreviewProps {
  code?: string;
  language?: string;
  className?: string;
  example?: string;
  initialHighlighted?: ReactElement;
  serverRenderedExample?: ReactElement;
}

/** Code this long or shorter shows in full; longer code opens as a peek. */
const PEEK_LINES = 6;

/**
 * An example and its code as one object: a tray holding the live example
 * on a card at the top, and the code beneath it on the tray itself. Long
 * code shows its first lines, fading out, and expands in place to a capped
 * height that scrolls, so its copy button and the collapse toggle stay in
 * reach however long it is.
 */
export function ComponentPreview({
  code,
  language = "tsx",
  className,
  example,
  initialHighlighted,
  serverRenderedExample,
}: ComponentPreviewProps) {
  const codeId = React.useId();
  const figureRef = React.useRef<HTMLElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const expandRef = React.useRef<HTMLButtonElement>(null);
  const collapseRef = React.useRef<HTMLButtonElement>(null);
  // The two toggles are different buttons, so focus follows from one to the
  // other when a keyboard (or anything) opened or closed the code from it.
  const moveFocus = React.useRef(false);
  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (expanded ? collapseRef : expandRef).current?.focus({
      preventScroll: true,
    });
  }, [expanded]);

  // Look up the example on the client, unless the server already rendered it
  // (async server-component examples).
  const ExampleComponent = example
    ? componentMap[example as keyof typeof componentMap]
    : null;
  const exampleNode =
    serverRenderedExample || (ExampleComponent && <ExampleComponent />);

  const lineCount = code ? code.trimEnd().split("\n").length : 0;
  const peeks = lineCount > PEEK_LINES;
  const collapsed = peeks && !expanded;

  const toggle = (): void => {
    const collapsing = expanded;
    moveFocus.current =
      document.activeElement === expandRef.current ||
      document.activeElement === collapseRef.current;
    setExpanded(!expanded);
    // Collapsing a long block pulls the page up under the reader; bring the
    // example back into view if it went off the top.
    if (collapsing) {
      requestAnimationFrame(() => {
        const figure = figureRef.current;
        if (figure && figure.getBoundingClientRect().top < 0) {
          figure.scrollIntoView({ block: "start" });
        }
      });
    }
  };

  return (
    <figure
      ref={figureRef}
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
        <div className="docs-example-code">
          <div
            id={codeId}
            data-collapsed={collapsed ? "" : undefined}
            className="docs-example-body"
          >
            <CodeBlock
              code={code}
              language={language}
              initial={initialHighlighted}
              className="rounded-none bg-transparent p-0 shadow-none"
            >
              <CodeBlockPre
                fadeEdges={expanded ? "y" : false}
                className={cn(
                  "rounded-none bg-transparent shadow-none",
                  expanded ? "max-h-[min(30rem,65dvh)]" : "max-h-none",
                )}
              >
                <CodeBlockCode />
              </CodeBlockPre>
            </CodeBlock>
            {/* Closed, the toggle floats over the faded peek, so the peek
                needs no bar under it; the whole peek opens the code too, a
                large target where the eye already is (hidden from assistive
                tech, which has the labelled button). */}
            {collapsed && (
              <>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={toggle}
                  className="docs-example-peek"
                />
                <button
                  ref={expandRef}
                  type="button"
                  aria-expanded={false}
                  aria-controls={codeId}
                  onClick={toggle}
                  className={cn("docs-example-expand", solidSurface(3, 2))}
                >
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  Show all {lineCount} lines
                </button>
              </>
            )}
          </div>

          {/* In the code's corner, outside its scroller, so it stays put
              while the code scrolls. */}
          <CopyButton content={code} className="docs-example-copy" />
          {peeks && expanded && (
            <div className="docs-example-bar">
              <button
                ref={collapseRef}
                type="button"
                aria-expanded
                aria-controls={codeId}
                onClick={toggle}
                className="docs-example-toggle"
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  strokeWidth={2}
                  className="size-3.5 rotate-180"
                />
                Collapse
              </button>
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
