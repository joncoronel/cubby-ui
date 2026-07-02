"use client";

import * as React from "react";

import type {
  FilterField,
  FilterSize,
  FilterValue,
  FiltersLabels,
} from "./lib/filters-types";

interface FiltersContextValue {
  fields: FilterField[];
  filters: FilterValue[];
  size: FilterSize;
  labels: FiltersLabels;
  fieldsById: Map<string, FilterField>;
  usedFieldIds: Set<string>;
  allowDuplicateFields: boolean;
  enableShortcut: boolean;
  shortcutKey: string;
  shortcutLabel: string | undefined;
  /** Id of the most recently added filter, used to auto-open its value control. */
  lastAddedId: string | null;
  addFilter: (filter: FilterValue) => void;
  updateFilter: (id: string, patch: Partial<Omit<FilterValue, "id">>) => void;
  removeFilter: (id: string) => void;
  clearAll: () => void;
}

const FiltersContext = React.createContext<FiltersContextValue | null>(null);

function useFilters(): FiltersContextValue {
  const context = React.useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within a Filters component.");
  }
  return context;
}

interface FilterChipContextValue {
  filter: FilterValue;
  field: FilterField;
  size: FilterSize;
  /** True when this chip was just added, so its value control opens itself. */
  autoOpen: boolean;
}

const FilterChipContext = React.createContext<FilterChipContextValue | null>(
  null,
);

function useFilterChip(): FilterChipContextValue {
  const context = React.useContext(FilterChipContext);
  if (!context) {
    throw new Error("useFilterChip must be used within a FilterChip.");
  }
  return context;
}

export {
  FiltersContext,
  useFilters,
  FilterChipContext,
  useFilterChip,
};
export type { FiltersContextValue, FilterChipContextValue };
