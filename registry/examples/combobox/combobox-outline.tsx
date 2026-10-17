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

export default function ComboboxOutline() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Default and outline</CardTitle>
        <CardDescription>
          Both read on a Card. <code>outline</code> takes the outline
          Button&apos;s fill and edge.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Combobox items={fruits}>
          <div className="flex flex-col gap-1">
            <ComboboxLabel>Default</ComboboxLabel>
            <ComboboxInput placeholder="Filled tint" />
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
            <ComboboxLabel>Outline</ComboboxLabel>
            <ComboboxInput variant="outline" placeholder="Fill with an edge" />
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
