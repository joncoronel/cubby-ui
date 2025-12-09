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

export default function SelectMultipleExample() {
  return (
    <Select defaultValue={["apple", "banana"]} multiple>
      <SelectTrigger className="w-[280px]">
        <SelectValue items={fruits} placeholder="Select fruits..." />
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
