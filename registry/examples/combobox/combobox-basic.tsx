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
} from "@/registry/default/combobox/combobox";

export default function ComboboxBasic() {
  return (
    <Combobox items={fruits}>
      <div className="flex w-full max-w-3xs flex-col gap-1">
        <ComboboxLabel>Choose a fruit</ComboboxLabel>
        <ComboboxInputWrapper>
          <ComboboxInput placeholder="e.g. Apple" />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <ComboboxClear />
            <ComboboxTrigger />
          </div>
        </ComboboxInputWrapper>
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

const fruits = [
  "Apple",
  "Banana",
  "Orange",
  "Pineapple",
  "Grape",
  "Mango",
  "Strawberry",
  "Blueberry",
  "Raspberry",
  "Blackberry",
  "Cherry",
  "Peach",
  "Pear",
  "Plum",
  "Kiwi",
  "Watermelon",
  "Cantaloupe",
  "Honeydew",
  "Papaya",
  "Guava",
  "Lychee",
  "Pomegranate",
  "Apricot",
  "Grapefruit",
  "Passionfruit",
];
