"use client";

import * as React from "react";
import {
  Filters,
  createFilter,
  type FilterField,
  type FilterValue,
} from "@/registry/default/filters/filters";

import { HugeiconsIcon } from "@hugeicons/react";
import { Tag01Icon } from "@hugeicons/core-free-icons";

function Dot({ className }: { className: string }) {
  return (
    <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />
  );
}

const fields: FilterField[] = [
  {
    id: "labels",
    label: "Labels",
    icon: <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />,
    type: "multiselect",
    maxSelections: 4,
    options: [
      { value: "bug", label: "Bug", icon: <Dot className="bg-[oklch(0.62_0.2_25)]" /> },
      {
        value: "feature",
        label: "Feature",
        icon: <Dot className="bg-[oklch(0.7_0.16_150)]" />,
      },
      {
        value: "docs",
        label: "Documentation",
        icon: <Dot className="bg-[oklch(0.6_0.2_250)]" />,
      },
      {
        value: "design",
        label: "Design",
        icon: <Dot className="bg-[oklch(0.6_0.2_290)]" />,
      },
      {
        value: "infra",
        label: "Infrastructure",
        icon: <Dot className="bg-[oklch(0.7_0_0)]" />,
      },
      {
        value: "a11y",
        label: "Accessibility",
        icon: <Dot className="bg-[oklch(0.75_0.15_75)]" />,
      },
      {
        value: "perf",
        label: "Performance",
        icon: <Dot className="bg-[oklch(0.6_0.2_290)]" />,
      },
      {
        value: "security",
        label: "Security",
        icon: <Dot className="bg-[oklch(0.62_0.2_25)]" />,
      },
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
