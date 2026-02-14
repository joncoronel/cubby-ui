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
  useCommandFilteredItems,
} from "@/registry/default/command/command";
import {
  useListVirtualizer,
  useHighlightHandler,
  type ListVirtualizerInstance,
} from "@/registry/default/hooks/use-list-virtualizer";
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
  const virtualizerRef = React.useRef<ListVirtualizerInstance>(null);
  const onItemHighlighted = useHighlightHandler(virtualizerRef);

  return (
    <div className="text-center">
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandDialogTrigger render={<Button>Search 1,000 Files</Button>} />
        <CommandDialogPopup>
          <Command
            items={allFiles}
            virtualized
            value={query}
            onValueChange={setQuery}
            itemToStringValue={getItemLabel}
            onItemHighlighted={onItemHighlighted}
          >
            <CommandContent>
              <CommandInput placeholder="Search files..." />
              <VirtualizedListContent
                query={query}
                open={open}
                virtualizerRef={virtualizerRef}
              />
            </CommandContent>
          </Command>
        </CommandDialogPopup>
      </CommandDialog>
    </div>
  );
}

function VirtualizedListContent({
  query,
  open,
  virtualizerRef,
}: {
  query: string;
  open: boolean;
  virtualizerRef: React.RefObject<ListVirtualizerInstance | null>;
}) {
  const filteredItems = useCommandFilteredItems<FileItem>();

  const {
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
    virtualizerRef,
  });

  return (
    <CommandVirtualizedList
      scrollRef={scrollRef}
      totalSize={totalSize}
      emptyMessage="No files found."
      nativeScroll
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
  );
}
