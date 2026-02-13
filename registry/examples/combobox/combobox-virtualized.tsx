"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxClear,
  ComboboxInput,
  ComboboxInputWrapper,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopup,
  ComboboxTrigger,
  ComboboxVirtualizedList,
  useComboboxFilteredItems,
} from "@/registry/default/combobox/combobox";
import {
  useListVirtualizer,
  useHighlightHandler,
  type ListVirtualizerInstance,
} from "@/registry/default/hooks/use-list-virtualizer";

interface City {
  id: string;
  name: string;
}

const allCities: City[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `city-${i}`,
  name: `City ${String(i + 1).padStart(4, "0")}`,
}));

const getItemLabel = (item: City) => item.name;

export default function ComboboxVirtualized() {
  const virtualizerRef = React.useRef<ListVirtualizerInstance>(null);
  const onItemHighlighted = useHighlightHandler(virtualizerRef);

  return (
    <Combobox
      items={allCities}
      virtualized
      itemToStringLabel={getItemLabel}
      itemToStringValue={getItemLabel}
      onItemHighlighted={onItemHighlighted}
    >
      <div className="flex w-full max-w-3xs flex-col gap-1">
        <ComboboxLabel>Search 1,000 cities</ComboboxLabel>
        <ComboboxInputWrapper>
          <ComboboxInput placeholder="e.g. City 0001" />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <ComboboxClear />
            <ComboboxTrigger />
          </div>
        </ComboboxInputWrapper>
      </div>
      <ComboboxPopup>
        <VirtualizedListContent virtualizerRef={virtualizerRef} />
      </ComboboxPopup>
    </Combobox>
  );
}

function VirtualizedListContent({
  virtualizerRef,
}: {
  virtualizerRef: React.RefObject<ListVirtualizerInstance | null>;
}) {
  const filteredItems = useComboboxFilteredItems<City>();

  const {
    scrollRef,
    measureRef,
    totalSize,
    virtualItems,
    getItem,
    getItemStyle,
    getItemProps,
  } = useListVirtualizer({
    items: allCities,
    filteredItems,
    estimateSize: 40,
    paddingStart: 4,
    paddingEnd: 4,
    virtualizerRef,
  });

  return (
    <ComboboxVirtualizedList
      scrollRef={scrollRef}
      totalSize={totalSize}
      emptyMessage="No cities found."
      fadeEdges="y"
      nativeScroll
    >
      {virtualItems.map((virtualItem) => {
        const item = getItem(virtualItem);
        if (!item) return null;

        return (
          <ComboboxItem
            key={virtualItem.key}
            ref={measureRef}
            value={item}
            style={getItemStyle(virtualItem)}
            className="mt-0! mb-0!"
            {...getItemProps(virtualItem)}
          >
            {item.name}
          </ComboboxItem>
        );
      })}
    </ComboboxVirtualizedList>
  );
}
