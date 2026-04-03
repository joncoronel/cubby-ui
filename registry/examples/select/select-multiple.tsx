"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";

const fruits = {
  apple: "Apple",
  banana: "Banana",
  orange: "Orange",
  grape: "Grape",
  strawberry: "Strawberry",
  watermelon: "Watermelon",
};

type Fruit = keyof typeof fruits;

function renderValue(value: Fruit[]) {
  if (value.length === 0) {
    return "Select fruits...";
  }
  const firstFruit = fruits[value[0]];
  const additional =
    value.length > 1 ? ` (+${value.length - 1} more)` : "";
  return firstFruit + additional;
}

export default function SelectMultipleExample() {
  return (
    <Select defaultValue={["apple", "banana"]} multiple>
      <SelectTrigger className="w-[280px]">
        <SelectValue>{renderValue}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(fruits) as Fruit[]).map((fruit) => (
          <SelectItem key={fruit} value={fruit}>
            {fruits[fruit]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
