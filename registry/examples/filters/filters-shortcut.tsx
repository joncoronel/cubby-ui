"use client";

import * as React from "react";
import {
  Filters,
  type FilterField,
  type FilterValue,
} from "@/registry/default/filters/filters";

function Dot({ className }: { className: string }) {
  return (
    <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />
  );
}

const fields: FilterField[] = [
  {
    id: "status",
    label: "Status",
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
  { id: "title", label: "Title", type: "text" },
];

export default function FiltersShortcut() {
  const [value, setValue] = React.useState<FilterValue[]>([]);

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-muted-foreground text-sm">
        Press <kbd className="text-foreground font-medium">F</kbd> (while not
        typing) to open the filter menu.
      </p>
      <Filters
        fields={fields}
        value={value}
        onValueChange={setValue}
        enableShortcut
        shortcutKey="f"
      />
    </div>
  );
}
