"use client";

import * as React from "react";
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteVirtualizedList,
} from "@/registry/default/autocomplete/autocomplete";
import { useListVirtualizer } from "@/registry/default/hooks/use-list-virtualizer";
import { Label } from "@/registry/default/label/label";

interface City {
  id: string;
  name: string;
}

// Generate 1000 mock cities
const allCities: City[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `city-${i}`,
  name: `City ${String(i + 1).padStart(4, "0")}`,
}));

const getItemLabel = (item: City | null) => item?.name ?? "";

export default function AutocompleteVirtualized() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const deferredQuery = React.useDeferredValue(query);

  // Use immediate value when empty to avoid stale results when clearing search
  const resolvedQuery =
    query === "" || deferredQuery === "" ? query : deferredQuery;

  const { contains } = Autocomplete.useFilter();

  const filteredItems = React.useMemo(
    () =>
      allCities.filter((city) => contains(city, resolvedQuery, getItemLabel)),
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
    items: allCities,
    filteredItems,
    estimateSize: 40,
    paddingStart: 4,
    paddingEnd: 4,
  });

  return (
    <Autocomplete.Root
      {...rootProps}
      open={open}
      onOpenChange={setOpen}
      value={query}
      onValueChange={setQuery}
      filter={null}
      itemToStringValue={getItemLabel}
    >
      <Label className="w-full max-w-xs">
        Search 1,000 cities
        <AutocompleteInput placeholder="e.g. City 0001" />
      </Label>

      <AutocompletePortal>
        <AutocompletePositioner>
          <AutocompletePopup>
            <AutocompleteVirtualizedList
              scrollRef={scrollRef}
              totalSize={totalSize}
              emptyMessage="No cities found."
              nativeScroll
            >
              {virtualItems.map((virtualItem) => {
                const item = getItem(virtualItem);
                if (!item) return null;

                return (
                  <AutocompleteItem
                    key={virtualItem.key}
                    ref={measureRef}
                    value={item}
                    style={getItemStyle(virtualItem)}
                    // Override first:/last: margins since virtualizer handles padding
                    className="mt-0! mb-0!"
                    {...getItemProps(virtualItem)}
                  >
                    {item.name}
                  </AutocompleteItem>
                );
              })}
            </AutocompleteVirtualizedList>
          </AutocompletePopup>
        </AutocompletePositioner>
      </AutocompletePortal>
    </Autocomplete.Root>
  );
}
