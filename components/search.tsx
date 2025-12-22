"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import type { SortedResult } from "fumadocs-core/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useRouter } from "next/navigation";
import { SharedProps } from "fumadocs-ui/contexts/search";
import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookOpenIcon,
  CornerDownLeftIcon,
  HashIcon,
  LoaderIcon,
  RocketIcon,
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
  highlightText,
} from "@/registry/default/command/command";
import { useDebouncedCallback } from "use-debounce";
import { Kbd } from "@/registry/default/kbd/kbd";
import { cn } from "@/lib/utils";

export default function CustomSearchDialog({
  open,
  onOpenChange,
}: SharedProps) {
  const [text, setText] = useState("");
  const { locale } = useI18n();
  const router = useRouter();
  const { search, setSearch, query } = useDocsSearch({
    type: "fetch",
    locale,
    delayMs: 0,
  });

  const defaultItems = [
    {
      id: "intro",
      content: "Introduction",
      url: "/docs",
      type: "page" as const,
    },
    {
      id: "install",
      content: "Installation",
      url: "/docs/installation",
      type: "page" as const,
    },
  ];

  const items =
    Array.isArray(query.data) && query.data.length > 0
      ? query.data
      : (query.isLoading && query.data === "empty") || !search
        ? defaultItems
        : [];

  const handleSelect = (item: SortedResult) => {
    router.push(item.url);
    onOpenChange(false);
  };
  const handleSearch = (value: string) => {
    setText(value);
    sendSearch(value);
  };

  const sendSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandDialogPopup className="mb-auto">
        <Command
          items={items}
          value={text}
          onValueChange={handleSearch}
          filter={null}
          open
        >
          <CommandContent>
            <CommandInput
              placeholder="Search documentation..."
              loading={
                ((query.isLoading && query.data === "empty") ||
                  (text && !search)) as boolean
              }
            />
            <CommandList
              emptyMessage={
                search &&
                items.length === 0 &&
                (!query.isLoading ||
                  (Array.isArray(query.data) && query.data.length === 0))
                  ? "No results found."
                  : null
              }
            >
              {(item: SortedResult) => (
                <CommandItem
                  key={item.id}
                  value={item}
                  onClick={() => handleSelect(item)}
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
