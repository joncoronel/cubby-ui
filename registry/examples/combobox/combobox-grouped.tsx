"use client";

import {
  Combobox,
  ComboboxClear,
  ComboboxInput,
  ComboboxInputWrapper,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxPopup,
  ComboboxEmpty,
  ComboboxLabel,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxCollection,
  ComboboxSeparator,
} from "@/registry/default/combobox/combobox";
import React from "react";

export default function ComboboxGrouped() {
  return (
    <Combobox items={groupedProduce}>
      <div className="flex w-full max-w-3xs flex-col gap-1">
        <ComboboxLabel>Select produce</ComboboxLabel>
        <ComboboxInputWrapper>
          <ComboboxInput placeholder="e.g. Mango" />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <ComboboxClear />
            <ComboboxTrigger />
          </div>
        </ComboboxInputWrapper>
      </div>
      <ComboboxPopup>
        <ComboboxEmpty>No produce found.</ComboboxEmpty>
        <ComboboxList fadeEdges={"bottom"}>
          {(group: ProduceGroup) => (
            <React.Fragment key={group.value}>
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxGroupLabel className="sticky top-0 z-[1]">
                  {group.value}
                </ComboboxGroupLabel>
                <ComboboxCollection>
                  {(item: Produce) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
              {group.value !== "Vegetables" && <ComboboxSeparator />}
            </React.Fragment>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}

interface Produce {
  id: string;
  label: string;
  group: "Fruits" | "Vegetables";
}

interface ProduceGroup {
  value: string;
  items: Produce[];
}

const produceData: Produce[] = [
  { id: "fruit-apple", label: "Apple", group: "Fruits" },
  { id: "fruit-banana", label: "Banana", group: "Fruits" },
  { id: "fruit-mango", label: "Mango", group: "Fruits" },
  { id: "fruit-kiwi", label: "Kiwi", group: "Fruits" },
  { id: "fruit-grape", label: "Grape", group: "Fruits" },
  { id: "fruit-orange", label: "Orange", group: "Fruits" },
  { id: "fruit-strawberry", label: "Strawberry", group: "Fruits" },
  { id: "fruit-watermelon", label: "Watermelon", group: "Fruits" },
  { id: "veg-broccoli", label: "Broccoli", group: "Vegetables" },
  { id: "veg-carrot", label: "Carrot", group: "Vegetables" },
  { id: "veg-cauliflower", label: "Cauliflower", group: "Vegetables" },
  { id: "veg-cucumber", label: "Cucumber", group: "Vegetables" },
  { id: "veg-kale", label: "Kale", group: "Vegetables" },
  { id: "veg-pepper", label: "Bell pepper", group: "Vegetables" },
  { id: "veg-spinach", label: "Spinach", group: "Vegetables" },
  { id: "veg-zucchini", label: "Zucchini", group: "Vegetables" },
];

function groupProduce(items: Produce[]): ProduceGroup[] {
  const groups: Record<string, Produce[]> = {};
  items.forEach((item) => {
    (groups[item.group] ??= []).push(item);
  });
  const order = ["Fruits", "Vegetables"];
  return order.map((value) => ({ value, items: groups[value] ?? [] }));
}

const groupedProduce: ProduceGroup[] = groupProduce(produceData);
