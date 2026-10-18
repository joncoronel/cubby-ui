"use client";

import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxPopup,
} from "@/registry/default/combobox/combobox";

const fruits = [
  "Apple",
  "Banana",
  "Orange",
  "Pineapple",
  "Grape",
  "Mango",
  "Strawberry",
];

export default function ComboboxOutline() {
  return (
    <Combobox items={fruits}>
      <div className="flex w-full max-w-sm flex-col gap-1">
        <ComboboxLabel>Fruit</ComboboxLabel>
        <ComboboxInput variant="outline" placeholder="Search fruits..." />
      </div>
      <ComboboxPopup>
        <ComboboxEmpty>No fruits found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string, index: number) => (
            <ComboboxItem key={index} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
