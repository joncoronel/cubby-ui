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
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

function Dot({ className }: { className: string }) {
  return (
    <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />
  );
}

const fields: FilterField[] = [
  {
    id: "status",
    label: "Status",
    icon: <HugeiconsIcon icon={DashboardCircleIcon} strokeWidth={2} />,
    type: "select",
    options: [
      { value: "todo", label: "Todo", icon: <Dot className="bg-[oklch(0.7_0_0)]" /> },
      {
        value: "in_progress",
        label: "In progress",
        icon: <Dot className="bg-[oklch(0.75_0.15_75)]" />,
      },
      { value: "done", label: "Done", icon: <Dot className="bg-[oklch(0.7_0.16_150)]" /> },
    ],
  },
  {
    // Restrict this field to two operators.
    id: "assignee",
    label: "Assignee",
    icon: <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />,
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
    icon: <HugeiconsIcon icon={TextFontIcon} strokeWidth={2} />,
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
