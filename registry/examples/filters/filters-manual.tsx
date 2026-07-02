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
