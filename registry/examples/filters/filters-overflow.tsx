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
  Flag02Icon,
  TextFontIcon,
  Timer01Icon,
  UserIcon,
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
      {
        value: "canceled",
        label: "Canceled",
        icon: <Dot className="bg-[oklch(0.62_0.2_25)]" />,
      },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    icon: <HugeiconsIcon icon={Flag02Icon} strokeWidth={2} />,
    type: "multiselect",
    options: [
      {
        value: "low",
        label: "Low",
        icon: <Dot className="bg-[oklch(0.7_0_0)]" />,
      },
      {
        value: "medium",
        label: "Medium",
        icon: <Dot className="bg-[oklch(0.6_0.2_250)]" />,
      },
      {
        value: "high",
        label: "High",
        icon: <Dot className="bg-[oklch(0.75_0.15_75)]" />,
      },
      {
        value: "urgent",
        label: "Urgent",
        icon: <Dot className="bg-[oklch(0.62_0.2_25)]" />,
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
    id: "assignee",
    label: "Assignee",
    icon: <HugeiconsIcon icon={UserIcon} strokeWidth={2} />,
    type: "select",
    options: [
      { value: "ada", label: "Ada Lovelace" },
      { value: "grace", label: "Grace Hopper" },
      { value: "linus", label: "Linus Torvalds" },
    ],
  },
  {
    id: "estimate",
    label: "Estimate",
    icon: <HugeiconsIcon icon={Timer01Icon} strokeWidth={2} />,
    type: "number",
  },
];

export default function FiltersOverflow() {
  const [value, setValue] = React.useState<FilterValue[]>(() => [
    createFilter(fields[0], { id: "seed-status", value: "in_progress" }),
    createFilter(fields[1], {
      id: "seed-priority",
      value: ["high", "urgent"],
    }),
    createFilter(fields[2], { id: "seed-title", value: "roadmap" }),
    createFilter(fields[3], { id: "seed-assignee", value: "grace" }),
    createFilter(fields[4], { id: "seed-estimate", operator: "gt", value: 3 }),
  ]);

  // More chips than fit: they scroll sideways behind edge fades (drag,
  // trackpad, or a plain mouse wheel), while Filter and Clear stay in view.
  return (
    <div className="w-full max-w-xl">
      <Filters fields={fields} value={value} onValueChange={setValue} />
    </div>
  );
}
