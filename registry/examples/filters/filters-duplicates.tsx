"use client";

import * as React from "react";
import {
  Filters,
  createFilter,
  type FilterField,
  type FilterValue,
} from "@/registry/default/filters/filters";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  TextFontIcon,
  Timer01Icon,
} from "@hugeicons/core-free-icons";

function Dot({ className }: { className: string }) {
  return (
    <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />
  );
}

const fields: FilterField[] = [
  {
    // Repeats: inherits the bar's allowDuplicateFields.
    id: "title",
    label: "Title",
    icon: <HugeiconsIcon icon={TextFontIcon} strokeWidth={2} />,
    type: "text",
  },
  {
    // Opts out: a range already fits in one chip with "between".
    id: "estimate",
    label: "Estimate",
    icon: <HugeiconsIcon icon={Timer01Icon} strokeWidth={2} />,
    type: "number",
    suffix: "pts",
    allowDuplicates: false,
  },
  {
    // Option fields always keep one chip, which the add menu edits.
    id: "status",
    label: "Status",
    icon: <HugeiconsIcon icon={DashboardCircleIcon} strokeWidth={2} />,
    type: "select",
    options: [
      {
        value: "todo",
        label: "Todo",
        icon: <Dot className="bg-[oklch(0.7_0_0)]" />,
      },
      {
        value: "in_progress",
        label: "In progress",
        icon: <Dot className="bg-[oklch(0.75_0.15_75)]" />,
      },
      {
        value: "done",
        label: "Done",
        icon: <Dot className="bg-[oklch(0.7_0.16_150)]" />,
      },
    ],
  },
];

export default function FiltersDuplicates() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], {
      id: "seed-title-contains",
      operator: "contains",
      value: "login",
    }),
    createFilter(fields[0], {
      id: "seed-title-excludes",
      operator: "not_contains",
      value: "flaky",
    }),
    createFilter(fields[1], {
      id: "seed-estimate",
      operator: "between",
      value: { min: 2, max: 8 },
    }),
  ]);

  return (
    <Filters
      fields={fields}
      value={value}
      onValueChange={setValue}
      allowDuplicateFields
      overflow="wrap"
    />
  );
}
