"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxPopup,
} from "@/registry/default/combobox/combobox";

export default function ComboboxElevated() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> on{" "}
          <code>ComboboxInput</code> when the combobox sits inside a Card,
          Dialog, or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Combobox items={fruits}>
          <div className="flex flex-col gap-1">
            <ComboboxLabel>Default</ComboboxLabel>
            <ComboboxInput placeholder="Collapses into the card" />
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

        <Combobox items={fruits}>
          <div className="flex flex-col gap-1">
            <ComboboxLabel>Elevated</ComboboxLabel>
            <ComboboxInput
              variant="elevated"
              placeholder="Reads against the substrate"
            />
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
      </CardContent>
    </Card>
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
];
