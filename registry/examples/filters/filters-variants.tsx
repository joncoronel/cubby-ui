"use client";

import * as React from "react";
import {
  Filters,
  createFilter,
  type FilterField,
  type FilterVariant,
  type FilterValue,
} from "@/registry/default/filters/filters";

import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardCircleIcon, TextFontIcon } from "@hugeicons/core-free-icons";

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
  {
    id: "title",
    label: "Title",
    icon: <HugeiconsIcon icon={TextFontIcon} strokeWidth={2} />,
    type: "text",
  },
];

const variants: FilterVariant[] = ["outline", "soft", "elevated"];

export default function FiltersVariants() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], { id: "seed-status", value: "in_progress" }),
    // No value yet, to show the incomplete border on every variant.
    createFilter(fields[1], { id: "seed-title" }),
  ]);

  return (
    <div className="flex w-full flex-col gap-4">
      {variants.map((variant) => (
        <Filters
          key={variant}
          fields={fields}
          variant={variant}
          value={value}
          onValueChange={setValue}
        />
      ))}
    </div>
  );
}
