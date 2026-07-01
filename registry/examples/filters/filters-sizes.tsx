"use client";

import * as React from "react";
import {
  Filters,
  createFilter,
  type FilterField,
  type FilterSize,
  type FilterValue,
} from "@/registry/default/filters/filters";

const fields: FilterField[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "todo", label: "Todo" },
      { value: "in_progress", label: "In progress" },
      { value: "done", label: "Done" },
    ],
  },
  { id: "title", label: "Title", type: "text" },
];

const sizes: FilterSize[] = ["sm", "default", "lg"];

export default function FiltersSizes() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], { id: "seed-status", value: "in_progress" }),
  ]);

  return (
    <div className="flex w-full flex-col gap-4">
      {sizes.map((size) => (
        <Filters
          key={size}
          fields={fields}
          size={size}
          value={value}
          onValueChange={setValue}
        />
      ))}
    </div>
  );
}
