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
    id: "labels",
    label: "Labels",
    type: "multiselect",
    options: [
      { value: "bug", label: "Bug" },
      { value: "feature", label: "Feature" },
      { value: "docs", label: "Documentation" },
      { value: "design", label: "Design" },
      { value: "infra", label: "Infrastructure" },
      { value: "a11y", label: "Accessibility" },
      { value: "perf", label: "Performance" },
      { value: "security", label: "Security" },
    ],
  },
];

export default function FiltersMultiselect() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], {
      id: "seed-labels",
      operator: "is_any_of",
      value: ["bug", "feature", "docs"],
    }),
  ]);

  return <Filters fields={fields} value={value} onValueChange={setValue} />;
}
