"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import type { SortedResult } from "fumadocs-core/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { SharedProps } from "fumadocs-ui/contexts/search";
import Link from "next/link";
import {
  Command,
  CommandContent,
  CommandDialog,
  CommandDialogPopup,
  CommandFooter,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/default/command/command";

import { Kbd } from "@/registry/default/kbd/kbd";
import { cn } from "@/lib/utils";
import { create } from "@orama/orama";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowTurnBackwardIcon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

function HashtagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 21L18 3" />
      <path d="M6 21L10 3" />
      <path d="M5 8H21" />
      <path d="M3 16H19" />
    </svg>
  );
}
/**
 * Renders a string containing `<mark>` tags into React elements.
 * fumadocs now returns search results with `<mark>` in the content string.
 */
function renderHighlightedContent(content: string): React.ReactNode {
  const parts = content.split(/(<mark>.*?<\/mark>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<mark>(.*?)<\/mark>$/);
    if (match) {
      return (
        <mark key={i} className="text-primary bg-transparent font-bold">
          {match[1]}
        </mark>
      );
    }
    return part;
  });
}

function initOrama() {
  return create({
    schema: { _: "string" },
    language: "english",
  });
}

export default function CustomSearchDialog({
  open,
  onOpenChange,
}: SharedProps) {
  const { locale } = useI18n();
  const { search, setSearch, query } = useDocsSearch({
    type: "static",
    initOrama,
    locale,
    delayMs: 100,
  });

  const defaultItems: SortedResult[] = [
    {
      id: "intro",
      content: "Introduction",
      url: "/docs/getting-started/introduction",
      type: "page",
    },
    {
      id: "install",
      content: "Installation",
      url: "/docs/getting-started/installation",
      type: "page",
    },
  ];

  const items =
    !search || query.data === "empty" || !query.data
      ? defaultItems
      : query.data;

  const emptyMessage =
    search && items.length === 0 ? "No results found." : null;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandDialogPopup>
        <Command
          items={items}
          value={search}
          onValueChange={setSearch}
          filter={null}
          open
        >
          <CommandContent>
            <CommandInput
              placeholder="Search documentation..."
              loading={query.isLoading}
            />
            <CommandList emptyMessage={emptyMessage}>
              {(item: SortedResult) => (
                <CommandItem
                  key={item.id}
                  value={item}
                  render={<Link href={item.url} prefetch={false} />}
                  onClick={() => onOpenChange(false)}
                  className={
                    item.type === "heading" || item.type === "text"
                      ? "before:bg-border relative pl-6 before:absolute before:inset-y-0 before:left-2.5 before:w-px"
                      : undefined
                  }
                >
                  {item.type === "heading" && (
                    <HashtagIcon className="text-muted-foreground size-3.5 shrink-0" />
                  )}
                  <div className="flex min-w-0 flex-col gap-0.5">
                    {item.breadcrumbs && item.breadcrumbs.length > 0 && (
                      <span className="text-muted-foreground truncate text-xs">
                        {item.breadcrumbs.join(" > ")}
                      </span>
                    )}
                    <span className="truncate">
                      {typeof item.content === "string" &&
                      query.data !== "empty"
                        ? renderHighlightedContent(item.content)
                        : item.content}
                    </span>
                  </div>
                </CommandItem>
              )}
            </CommandList>
          </CommandContent>
          <CommandFooter
            className={cn(
              "ease-out-cubic overflow-clip transition-[height,opacity,padding] duration-200",
              // search && items.length === 0
              //   ? "h-0 p-0 opacity-0"
              //   : "h-[calc-size(min-content,size)] opacity-100",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Kbd size="sm" className="px-1">
                  <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-3"  strokeWidth={2} />
                </Kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Kbd size="sm" className="px-1">
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3"  strokeWidth={2} />
                </Kbd>
                <Kbd size="sm" className="px-1">
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3"  strokeWidth={2} />
                </Kbd>
                <span>to navigate</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd size="sm">esc</Kbd>
              <span>to close</span>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  );
}
