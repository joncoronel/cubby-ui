"use client";

import * as React from "react";
import {
  Filters,
  type FilterField,
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
  {
    id: "labels",
    label: "Labels",
    type: "multiselect",
    options: [
      { value: "bug", label: "Bug" },
      { value: "feature", label: "Feature" },
      { value: "docs", label: "Docs" },
    ],
  },
  { id: "estimate", label: "Estimate", type: "number" },
];

export default function FiltersControlled() {
  const [value, setValue] = React.useState<FilterValue[]>([]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Filters
        fields={fields}
        value={value}
        onValueChange={setValue}
        showActiveCount
      />
      <pre className="bg-muted text-muted-foreground max-h-56 overflow-auto rounded-lg p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
