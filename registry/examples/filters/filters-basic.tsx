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
      { value: "canceled", label: "Canceled" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    type: "multiselect",
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  { id: "title", label: "Title", type: "text" },
  { id: "estimate", label: "Estimate", type: "number" },
];

export default function FiltersBasic() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], { id: "seed-status", value: "in_progress" }),
  ]);

  return <Filters fields={fields} value={value} onValueChange={setValue} />;
}
