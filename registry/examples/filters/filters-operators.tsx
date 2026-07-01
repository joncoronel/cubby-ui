"use client";

import * as React from "react";
import {
  Filters,
  createFilter,
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
    // Restrict this field to two operators.
    id: "assignee",
    label: "Assignee",
    type: "select",
    disabledOperators: ["is_empty", "is_not_empty"],
    options: [
      { value: "alex", label: "Alex" },
      { value: "sam", label: "Sam" },
      { value: "jordan", label: "Jordan" },
    ],
  },
  {
    // Fully custom operator set.
    id: "title",
    label: "Title",
    type: "text",
    operators: [
      { id: "contains", label: "contains" },
      { id: "is", label: "is exactly" },
      { id: "is_empty", label: "is empty", valueless: true },
    ],
  },
];

export default function FiltersOperators() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], {
      id: "seed-status",
      operator: "is_not",
      value: "done",
    }),
    createFilter(fields[2], { id: "seed-title", operator: "is_empty" }),
  ]);

  return <Filters fields={fields} value={value} onValueChange={setValue} />;
}
