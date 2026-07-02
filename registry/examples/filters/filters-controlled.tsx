"use client";

import * as React from "react";
import {
  Filters,
  type FilterField,
  type FilterValue,
} from "@/registry/default/filters/filters";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  Tag01Icon,
  Timer01Icon,
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
    id: "labels",
    label: "Labels",
    icon: <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />,
    type: "multiselect",
    options: [
      { value: "bug", label: "Bug", icon: <Dot className="bg-[oklch(0.62_0.2_25)]" /> },
      {
        value: "feature",
        label: "Feature",
        icon: <Dot className="bg-[oklch(0.7_0.16_150)]" />,
      },
      { value: "docs", label: "Docs", icon: <Dot className="bg-[oklch(0.6_0.2_250)]" /> },
    ],
  },
  {
    id: "estimate",
    label: "Estimate",
    icon: <HugeiconsIcon icon={Timer01Icon} strokeWidth={2} />,
    type: "number",
  },
];

export default function FiltersControlled() {
  const [value, setValue] = React.useState<FilterValue[]>([]);

  return (
    <div className="flex w-full flex-col gap-4">
      <Filters
        fields={fields}
        value={value}
        onValueChange={setValue}
        showActiveCount
      />
      <pre className="bg-muted text-muted-foreground max-h-56 overflow-auto rounded-lg p-3 text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
