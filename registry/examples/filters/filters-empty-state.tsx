"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import {
  FilterActions,
  FilterActionsAdd,
  FilterActionsClear,
  FilterChips,
  FiltersBar,
  FiltersProvider,
  type FilterField,
  type FilterValue,
} from "@/registry/default/filters/filters";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  PlusSignIcon,
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
  {
    id: "estimate",
    label: "Estimate",
    icon: <HugeiconsIcon icon={Timer01Icon} strokeWidth={2} />,
    type: "number",
  },
];

export default function FiltersEmptyState() {
  const [value, setValue] = React.useState<FilterValue[]>([]);
  // The add menu is controlled, so a button outside the bar can open it.
  const [adding, setAdding] = React.useState(false);

  return (
    <FiltersProvider fields={fields} value={value} onValueChange={setValue}>
      <div className="flex w-full max-w-xl flex-col gap-3">
        <FiltersBar>
          <FilterChips />
          <FilterActions>
            <FilterActionsAdd open={adding} onOpenChange={setAdding} />
            <FilterActionsClear />
          </FilterActions>
        </FiltersBar>
        {value.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">No filters yet</p>
              <p className="text-muted-foreground text-sm">
                Narrow the list by status, title, or estimate.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leadingIcon={
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              }
              onClick={() => setAdding(true)}
            >
              Add your first filter
            </Button>
          </div>
        )}
      </div>
    </FiltersProvider>
  );
}
