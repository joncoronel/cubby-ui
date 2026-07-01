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
      { value: "design", label: "Design" },
    ],
  },
  { id: "title", label: "Title", type: "text" },
  { id: "estimate", label: "Estimate", type: "number" },
  {
    // The custom escape hatch: a native date input driving the filter value.
    id: "due",
    label: "Due date",
    type: "custom",
    defaultValue: "",
    renderValue: ({ value, onValueChange }) => (
      <input
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onValueChange(event.target.value)}
        className="focus-visible:outline-ring/50 h-10 rounded-none bg-transparent px-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 sm:h-9"
      />
    ),
  },
];

export default function FiltersFieldTypes() {
  const [value, setValue] = React.useState<FilterValue[]>([]);
  return <Filters fields={fields} value={value} onValueChange={setValue} />;
}
