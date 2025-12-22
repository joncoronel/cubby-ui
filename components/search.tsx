"use client";

import * as React from "react";
import { useDocsSearch } from "fumadocs-core/search/client";
import type { SortedResult } from "fumadocs-core/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useRouter } from "next/navigation";
import { SharedProps } from "fumadocs-ui/contexts/search";
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
  highlightText,
} from "@/registry/default/command/command";
import { Kbd } from "@/registry/default/kbd/kbd";

export default function CustomSearchDialog({
  open,
  onOpenChange,
}: SharedProps) {
  const { locale } = useI18n();
  const router = useRouter();
  const { search, setSearch, query } = useDocsSearch({
    type: "fetch",
    locale,
    delayMs: 300,
  });

  // Track our own searching state to handle the debounce period
  // isSearching becomes true immediately on input change, and false only after fetch completes
  const [isSearching, setIsSearching] = React.useState(false);
  const wasLoading = React.useRef(false);

  // Set isSearching to true immediately when search changes
  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearch(value);
      if (value) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    },
    [setSearch],
  );

  // Set isSearching to false when query.isLoading transitions from true to false
  React.useEffect(() => {
    if (wasLoading.current && !query.isLoading) {
      setIsSearching(false);
    }
    wasLoading.current = query.isLoading;
  }, [query.isLoading]);

  // Prepare items from search results
  const items = query.data !== "empty" && query.data ? query.data : [];

  const handleSelect = (item: SortedResult) => {
    router.push(item.url);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandDialogPopup>
        <Command
          items={items}
          value={search}
          onValueChange={handleSearchChange}
          filter={null}
          open
        >
          <CommandContent>
            <CommandInput placeholder="Search documentation..." />
            <CommandList
              emptyMessage={
                isSearching ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="border-muted-foreground border-t-foreground animation-duration-[250ms] size-4 animate-spin rounded-full border-2"
                      aria-hidden
                    />
                    Searching...
                  </div>
                ) : search ? (
                  "No results found."
                ) : (
                  "Type to search..."
                )
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
                      {typeof item.content === "string"
                        ? highlightText(item.content, search)
                        : item.content}
                    </span>
                  </div>
                </CommandItem>
              )}
            </CommandList>
          </CommandContent>
          <CommandFooter>
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
