"use client";

import * as React from "react";
import {
  Command,
  CommandContent,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandInput,
  CommandItem,
  CommandVirtualizedList,
  useCommandFilter,
} from "@/registry/default/command/command";
import { useListVirtualizer } from "@/registry/default/hooks/use-list-virtualizer";
import { highlightText } from "@/registry/default/lib/highlight-text";
import { Button } from "@/registry/default/button/button";
import { FileIcon } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
}

// Generate 1000 mock files
const allFiles: FileItem[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `file-${i}`,
  name: `file-${i}.tsx`,
}));

const getItemLabel = (item: FileItem | null) => item?.name ?? "";

export default function CommandVirtualized() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const deferredQuery = React.useDeferredValue(query);

  // Use immediate value when empty to avoid stale results when clearing search
  const resolvedQuery =
    query === "" || deferredQuery === "" ? query : deferredQuery;

  const { contains } = useCommandFilter();

  const filteredItems = React.useMemo(
    () =>
      allFiles.filter((file) => contains(file, resolvedQuery, getItemLabel)),
    [contains, resolvedQuery],
  );

  const {
    rootProps,
    scrollRef,
    measureRef,
    totalSize,
    virtualItems,
    getItem,
    getItemStyle,
    getItemProps,
  } = useListVirtualizer({
    enabled: open,
    items: allFiles,
    filteredItems,
    estimateSize: 40,
  });

  return (
    <div className="text-center">
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandDialogTrigger render={<Button>Search 1,000 Files</Button>} />
        <CommandDialogPopup>
          <Command
            {...rootProps}
            value={query}
            onValueChange={setQuery}
            filter={null}
            open={open}
            itemToStringValue={getItemLabel}
          >
            <CommandContent>
              <CommandInput placeholder="Search files..." />
              <CommandVirtualizedList
                scrollRef={scrollRef}
                totalSize={totalSize}
                emptyMessage="No files found."
                nativeScroll={true}
              >
                {virtualItems.map((virtualItem) => {
                  const item = getItem(virtualItem);
                  if (!item) return null;

                  return (
                    <CommandItem
                      key={virtualItem.key}
                      ref={measureRef}
                      value={item}
                      style={getItemStyle(virtualItem)}
                      {...getItemProps(virtualItem)}
                    >
                      <FileIcon />
                      <span className="truncate">
                        {highlightText(item.name, query)}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandVirtualizedList>
            </CommandContent>
          </Command>
        </CommandDialogPopup>
      </CommandDialog>
    </div>
  );
}
