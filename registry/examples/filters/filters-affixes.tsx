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
    id: "budget",
    label: "Budget",
    type: "number",
    prefix: "$",
  },
  {
    id: "estimate",
    label: "Estimate",
    type: "number",
    suffix: "hrs",
  },
  {
    id: "progress",
    label: "Progress",
    type: "number",
    suffix: "%",
  },
  {
    id: "handle",
    label: "Handle",
    type: "text",
    prefix: "@",
  },
];

export default function FiltersAffixes() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], { id: "seed-budget", operator: "gt", value: 1000 }),
    createFilter(fields[1], { id: "seed-estimate", operator: "lt", value: 8 }),
  ]);

  return <Filters fields={fields} value={value} onValueChange={setValue} />;
}
