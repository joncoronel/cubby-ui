"use client";

import * as React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useQueryState } from "nuqs";
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
  {
    id: "labels",
    label: "Labels",
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
  { id: "title", label: "Title", type: "text" },
];

function FiltersNuqsDemo() {
  // Persist the filters array in the `?filters=` query param as JSON. Because
  // `Filters` is already controlled, wiring it to nuqs is just value + setter.
  const [raw, setRaw] = useQueryState("filters");
  const value = React.useMemo<FilterValue[]>(() => {
    if (!raw) return [];
    try {
      return JSON.parse(raw) as FilterValue[];
    } catch {
      return [];
    }
  }, [raw]);

  return (
    <div className="flex w-full flex-col gap-3">
      <Filters
        fields={fields}
        value={value}
        onValueChange={(next) =>
          setRaw(next.length ? JSON.stringify(next) : null)
        }
      />
      <p className="text-muted-foreground text-sm">
        Filters persist in the URL as <code>?filters=</code>. Reload the page and
        they stick.
      </p>
    </div>
  );
}

export default function FiltersNuqs() {
  // Mount <NuqsAdapter> once at your app root; it lives here so the example is
  // self-contained.
  return (
    <NuqsAdapter>
      <FiltersNuqsDemo />
    </NuqsAdapter>
  );
}
