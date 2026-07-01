"use client";

import * as React from "react";
import {
  Filters,
  FilterAddButton,
  FilterChip,
  FilterClearButton,
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
  { id: "title", label: "Title", type: "text" },
  { id: "estimate", label: "Estimate", type: "number" },
];

export default function FiltersManual() {
  const [value, setValue] = React.useState<FilterValue[]>([]);

  return (
    <Filters fields={fields} value={value} onValueChange={setValue}>
      <FilterAddButton />
      {value.map((filter) => {
        const field = fields.find((item) => item.id === filter.field);
        if (!field) return null;
        return <FilterChip key={filter.id} filter={filter} field={field} />;
      })}
      {value.length > 0 && <FilterClearButton />}
    </Filters>
  );
}
