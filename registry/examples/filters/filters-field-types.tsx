"use client";

import * as React from "react";
import {
  Filters,
  type FilterField,
  type FilterValue,
} from "@/registry/default/filters/filters";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  DashboardCircleIcon,
  Tag01Icon,
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
      {
        value: "design",
        label: "Design",
        icon: <Dot className="bg-[oklch(0.6_0.2_290)]" />,
      },
    ],
  },
  {
    id: "title",
    label: "Title",
    icon: <HugeiconsIcon icon={TextFontIcon} strokeWidth={2} />,
    type: "text",
  },
  {
    id: "estimate",
    label: "Estimate",
    icon: <HugeiconsIcon icon={Timer01Icon} strokeWidth={2} />,
    type: "number",
  },
  {
    // The custom escape hatch: a native date input driving the filter value.
    id: "due",
    label: "Due date",
    icon: <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />,
    type: "custom",
    defaultValue: "",
    renderValue: ({ value, onValueChange }) => (
      <input
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onValueChange(event.target.value)}
        className="focus-visible:outline-ring/50 h-10 rounded-none bg-transparent px-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 sm:h-9"
      />
    ),
  },
];

export default function FiltersFieldTypes() {
  const [value, setValue] = React.useState<FilterValue[]>([]);
  return <Filters fields={fields} value={value} onValueChange={setValue} />;
}
