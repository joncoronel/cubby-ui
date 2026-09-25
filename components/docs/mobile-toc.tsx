"use client";

import * as React from "react";
import type { TOCItemType } from "fumadocs-core/toc";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
import { solidSurface } from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";
import { useDocsPageState } from "./docs-page-store";
import { MorphText, toPlainText } from "./morph-text";
import { scrollToHeading } from "./scroll-to-heading";
import { useActiveHeading } from "./use-headings";

const RING = 2 * Math.PI * 6.25;

/**
 * Fills a ring with the reader's progress down the page. Written straight to
 * the SVG on scroll so the pill never re-renders for it.
 */
function ProgressRing() {
  const ref = React.useRef<SVGCircleElement>(null);

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ref.current?.style.setProperty(
        "stroke-dashoffset",
        String(RING * (1 - progress)),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 -rotate-90"
    >
      <circle cx="8" cy="8" r="6.25" className="docs-ring-track" />
      <circle
        ref={ref}
        cx="8"
        cy="8"
        r="6.25"
        strokeDasharray={RING}
        strokeDashoffset={RING}
        className="docs-ring-fill"
      />
    </svg>
  );
}

/**
 * The phone's table of contents: a pill floating at the bottom that names the
 * section you're in. Tap it for the full list, which opens upward from it.
 */
export function MobileToc({ toc }: { toc: TOCItemType[] }) {
  const active = useActiveHeading();
  const { pastTitle } = useDocsPageState();
  const [open, setOpen] = React.useState(false);
  const listRef = React.useRef<HTMLUListElement>(null);

  // Opening a long list lands on the section you're in.
  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      listRef.current
        ?.querySelector('[aria-current="location"]')
        ?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const current = toc.find((item) => item.url === `#${active}`) ?? toc[0];
  const visible = pastTitle || open;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        data-visible={visible ? "" : undefined}
        inert={!visible}
        className="docs-toc-pill-wrap fixed inset-x-0 z-30 flex justify-center px-4 md:hidden"
      >
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "docs-toc-pill focus-visible:outline-ring/50 flex h-10 max-w-full min-w-0 items-center gap-2.5 rounded-full pr-3 pl-3.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
                solidSurface(3, 5),
              )}
            />
          }
        >
          <ProgressRing />
          <span className="sr-only">On this page, current section: </span>
          <MorphText truncate className="text-foreground font-medium">
            {toPlainText(current?.title)}
          </MorphText>
          <HugeiconsIcon
            icon={ArrowUp01Icon}
            strokeWidth={2}
            className="docs-toc-pill-chevron text-muted-foreground size-3.5 shrink-0"
          />
        </PopoverTrigger>
      </div>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        positionMethod="fixed"
        className="p-0"
      >
        <nav
          aria-label="On this page"
          className="w-[min(20rem,calc(100vw-2rem))]"
        >
          <p className="text-muted-foreground px-4 pt-3 pb-1 text-xs font-medium">
            On this page
          </p>
          <ScrollArea
            fadeEdges="y"
            overscrollBehavior="contain"
            viewportClassName="max-h-[55dvh]"
          >
            <ul ref={listRef} className="flex flex-col px-2 pb-2">
              {toc.map((item) => {
                const isActive = item.url === `#${active}`;
                return (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      onClick={(event) => {
                        scrollToHeading(event);
                        setOpen(false);
                      }}
                      data-depth={Math.min(item.depth, 4)}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "flex min-h-10 items-center rounded-lg px-2 py-2 text-sm transition-colors duration-150",
                        "data-[depth=3]:pl-5 data-[depth=4]:pl-8",
                        isActive
                          ? "text-foreground bg-surface-selected font-medium"
                          : "text-muted-foreground active:bg-surface-hover",
                      )}
                    >
                      <span className="line-clamp-2">{item.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </nav>
      </PopoverContent>
    </Popover>
  );
}
