"use client";

import * as React from "react";
import type { TOCItemType } from "fumadocs-core/toc";
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
} from "@/registry/default/preview-card/preview-card";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
import { cn } from "@/lib/utils";
import { resetDocsPageState, setDocsPageState } from "./docs-page-store";
import { MobileToc } from "./mobile-toc";
import {
  HeadingsProvider,
  useActiveHeading,
  useVisibleHeadings,
} from "./use-headings";
import { scrollToHeading } from "./scroll-to-heading";

/** Publishes the reader's position for the header's section crumb. */
function PageTracker({ toc }: { toc: TOCItemType[] }) {
  const active = useActiveHeading();

  React.useEffect(() => {
    setDocsPageState({ toc });
    return () => resetDocsPageState();
  }, [toc]);

  React.useEffect(() => {
    setDocsPageState({ activeId: active ?? null });
  }, [active]);

  React.useEffect(() => {
    const title = document.getElementById("docs-title");
    if (!title) return;
    const observer = new IntersectionObserver(
      ([entry]) => setDocsPageState({ pastTitle: !entry.isIntersecting }),
      // The header and the frame's top edge cover the top ~64px.
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, []);

  return null;
}

/**
 * A minimap of the page's headings. The ticks sit quietly in the margin;
 * hovering them opens the same list as readable titles in a preview card.
 */
function Minimap({ toc }: { toc: TOCItemType[] }) {
  const visible = useVisibleHeadings();
  const active = useActiveHeading();

  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={
          <div
            aria-hidden="true"
            className="docs-minimap flex max-h-[50dvh] flex-col gap-2.5 overflow-hidden py-3 pl-6"
          />
        }
      >
        {toc.map((item) => {
          const id = item.url.slice(1);
          return (
            <span
              key={item.url}
              data-depth={Math.min(item.depth, 4)}
              data-visible={visible.includes(id) ? "" : undefined}
              data-active={id === active ? "" : undefined}
              className="docs-minimap-tick"
            />
          );
        })}
      </PreviewCardTrigger>

      <PreviewCardContent
        side="left"
        align="center"
        sideOffset={-56}
        positionMethod="fixed"
        arrow={false}
        className="w-60 p-0"
      >
        <nav aria-label="On this page">
          <ScrollArea
            fadeEdges="y"
            overscrollBehavior="contain"
            viewportClassName="max-h-[50dvh]"
          >
            <ul className="flex flex-col px-4 py-3 text-sm">
              {toc.map((item) => {
                const isActive = item.url.slice(1) === active;
                return (
                  <li key={item.url} className="flex">
                    <a
                      href={item.url}
                      onClick={scrollToHeading}
                      data-depth={Math.min(item.depth, 4)}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "line-clamp-2 w-full py-1 transition-colors duration-150",
                        "data-[depth=3]:pl-3 data-[depth=4]:pl-6",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </nav>
      </PreviewCardContent>
    </PreviewCard>
  );
}

export function PageNavigation({
  toc,
  className,
}: {
  toc: TOCItemType[];
  className?: string;
}) {
  return (
    <HeadingsProvider toc={toc}>
      <PageTracker toc={toc} />
      {toc.length > 1 && (
        <>
          <div className={cn("hidden xl:block", className)}>
            <Minimap toc={toc} />
          </div>
          <MobileToc toc={toc} />
        </>
      )}
    </HeadingsProvider>
  );
}
