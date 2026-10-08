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
import { useDocsPage } from "./docs-page-store";
import { MobileToc } from "./mobile-toc";
import { useTrackHeadings } from "./use-headings";
import { scrollToHeading } from "./scroll-to-heading";

/**
 * A minimap of the page's headings. The ticks sit quietly in the margin;
 * hovering them opens the same list as readable titles in a preview card.
 */
function Minimap({ toc }: { toc: TOCItemType[] }) {
  const visible = useDocsPage("visible");
  const active = useDocsPage("activeId");

  return (
    <PreviewCard>
      <PreviewCardTrigger
        delay={0}
        closeDelay={0}
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
        className="w-60"
        viewportClassName="p-0"
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
  useTrackHeadings(toc);

  if (toc.length < 2) return null;
  return (
    <>
      <div className={cn("hidden xl:block", className)}>
        <Minimap toc={toc} />
      </div>
      <MobileToc toc={toc} />
    </>
  );
}
