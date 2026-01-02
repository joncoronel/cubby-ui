"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import type { SortedResult } from "fumadocs-core/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { SharedProps } from "fumadocs-ui/contexts/search";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CornerDownLeftIcon,
  HashIcon,
} from "lucide-react";
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

import { highlightText } from "@/registry/default/lib/highlight-text";
import { Kbd } from "@/registry/default/kbd/kbd";
import { cn } from "@/lib/utils";
import { create } from "@orama/orama";

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
                  render={<Link href={item.url} />}
                  onClick={() => onOpenChange(false)}
                  className={
                    item.type === "heading" || item.type === "text"
                      ? "before:bg-border relative pl-6 before:absolute before:inset-y-0 before:left-2.5 before:w-px"
                      : undefined
                  }
                >
                  {item.type === "heading" && (
                    <HashIcon className="text-muted-foreground size-3.5 shrink-0" />
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
                        ? highlightText(item.content, search)
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
                  <CornerDownLeftIcon className="size-3" />
                </Kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Kbd size="sm" className="px-1">
                  <ArrowUpIcon className="size-3" />
                </Kbd>
                <Kbd size="sm" className="px-1">
                  <ArrowDownIcon className="size-3" />
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
