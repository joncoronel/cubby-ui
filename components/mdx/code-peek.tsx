"use client";

import * as React from "react";
import type { ReactElement } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import {
  CodeBlock,
  CodeBlockPre,
  CodeBlockCode,
} from "@/registry/default/code-block/code-block";
import { Button } from "@/registry/default/button/button";
import { CopyButton } from "@/registry/default/copy-button/copy-button";
import { cn } from "@/lib/utils";
import { PEEK_LINES } from "./code-peek-lines";

interface CodePeekProps {
  code: string;
  language?: string;
  /** Server-highlighted nodes, shown before the client highlighter runs. */
  initial?: ReactElement;
  /**
   * The first lines alone, highlighted (see `highlightPeek`): what a closed
   * peek renders, so the rest isn't built until it opens.
   */
  peekInitial?: ReactElement;
  /**
   * `flat` sets the code straight on the tray it sits in (an example's
   * code); `card` keeps the code block's own card (source in a tray with a
   * header above it).
   */
  variant?: "flat" | "card";
  /**
   * Fill the height it's given and scroll, with no peek or toggle: the code
   * pane of a window whose height something else sets (a file tree).
   */
  fill?: boolean;
  className?: string;
}

/**
 * Code that opens as a peek when it's long: its first lines fading out,
 * with one toggle floating at its foot that expands it in place to a capped
 * height that scrolls, and collapses it again. The copy button floats in
 * its top-right corner. Both stay in reach however long the code is.
 */
export function CodePeek({
  code,
  language = "tsx",
  initial,
  peekInitial,
  variant = "flat",
  fill = false,
  className,
}: CodePeekProps) {
  const codeId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState(false);

  const lineCount = code.trimEnd().split("\n").length;
  const peeks = !fill && lineCount > PEEK_LINES;
  const collapsed = peeks && !expanded;

  // New code (another file's tab) starts closed again.
  const [prevCode, setPrevCode] = React.useState(code);
  if (code !== prevCode) {
    setPrevCode(code);
    setExpanded(false);
  }

  const toggle = (): void => {
    const collapsing = expanded;
    setExpanded(!expanded);
    // Collapsing a long block pulls the page up under the reader; bring what
    // it belongs to (the example, or the install step) back into view if it
    // went off the top.
    if (collapsing) {
      requestAnimationFrame(() => {
        const root = rootRef.current;
        const anchor = root?.closest<HTMLElement>("figure, li") ?? root;
        if (anchor && anchor.getBoundingClientRect().top < 0) {
          anchor.scrollIntoView({ block: "start" });
        }
      });
    }
  };

  return (
    <div
      ref={rootRef}
      data-variant={variant}
      data-fill={fill ? "" : undefined}
      className={cn("docs-peek", className)}
    >
      <div
        id={codeId}
        data-collapsed={collapsed ? "" : undefined}
        data-expanded={peeks && expanded ? "" : undefined}
        className="docs-peek-body"
      >
        <CodeBlock
          code={code}
          language={language}
          initial={collapsed && peekInitial ? peekInitial : initial}
          className="rounded-none bg-transparent p-0 shadow-none"
        >
          <CodeBlockPre
            fadeEdges={fill || expanded ? "y" : false}
            className={cn(
              variant === "flat" && "rounded-none bg-transparent shadow-none",
              fill
                ? "h-full max-h-none"
                : expanded
                  ? "max-h-[min(30rem,65dvh)]"
                  : "max-h-none",
            )}
          >
            <CodeBlockCode />
          </CodeBlockPre>
        </CodeBlock>
        {/* The whole closed peek opens the code too, a large target where
            the eye already is (hidden from assistive tech, which has the
            labelled button). */}
        {collapsed && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={toggle}
            className="docs-peek-overlay"
          />
        )}
        {/* One toggle floating at the foot of the code, open or closed: it
            never moves out from under the pointer or loses focus, and the
            open code is capped, so it is always in view. */}
        {peeks && (
          <Button
            variant="outline"
            size="xs"
            aria-expanded={expanded}
            aria-controls={codeId}
            onClick={toggle}
            className="docs-peek-toggle rounded-full"
            leadingIcon={
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className="docs-peek-chevron"
              />
            }
          >
            {expanded ? "Collapse" : `Show all ${lineCount} lines`}
          </Button>
        )}
      </div>

      {/* In the code's corner, outside its scroller, so it stays put while
          the code scrolls. */}
      <CopyButton content={code} className="docs-peek-copy" />
    </div>
  );
}
