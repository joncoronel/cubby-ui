"use client";

import * as React from "react";

import type {
  FilterField,
  FilterSize,
  FilterValue,
  FiltersLabels,
} from "./lib/filters-types";

/** Fast-changing: `filters` gets a new identity on every edit, including keystrokes. */
interface FiltersStateContextValue {
  filters: FilterValue[];
}

/** Config and actions; stable across value edits, so leaves don't re-render per keystroke. */
interface FiltersActionsContextValue {
  fields: FilterField[];
  size: FilterSize;
  labels: FiltersLabels;
  fieldsById: Map<string, FilterField>;
  /** Field ids with at least one active filter. Stable across value edits. */
  usedFieldIds: Set<string>;
  allowDuplicateFields: boolean;
  addFilter: (filter: FilterValue) => void;
  updateFilter: (id: string, patch: Partial<Omit<FilterValue, "id">>) => void;
  removeFilter: (id: string) => void;
  clearAll: () => void;
  /** The filters as of the last render, for handlers that shouldn't subscribe. */
  getFilters: () => FilterValue[];
}

type FiltersContextValue = FiltersStateContextValue &
  FiltersActionsContextValue;

const FiltersStateContext =
  React.createContext<FiltersStateContextValue | null>(null);
const FiltersActionsContext =
  React.createContext<FiltersActionsContextValue | null>(null);

/** The bar's fast-changing state (`filters`). Re-renders on every edit. */
function useFiltersState(): FiltersStateContextValue {
  const context = React.use(FiltersStateContext);
  if (!context) {
    throw new Error("useFiltersState must be used within a FiltersProvider.");
  }
  return context;
}

/** The bar's config and actions. Stable while a filter value is being edited. */
function useFiltersActions(): FiltersActionsContextValue {
  const context = React.use(FiltersActionsContext);
  if (!context) {
    throw new Error("useFiltersActions must be used within a FiltersProvider.");
  }
  return context;
}

/** Both contexts merged; re-renders on every edit (prefer `useFiltersActions` when that matters). */
function useFilters(): FiltersContextValue {
  const state = useFiltersState();
  const actions = useFiltersActions();
  return React.useMemo(() => ({ ...state, ...actions }), [state, actions]);
}

interface FilterChipContextValue {
  filter: FilterValue;
  field: FilterField;
  size: FilterSize;
}

/** `count` bumps per announcement so a repeated message still registers. */
interface FiltersAnnouncementValue {
  text: string;
  count: number;
}

const FiltersAnnouncementContext =
  React.createContext<FiltersAnnouncementValue>({ text: "", count: 0 });

const FilterChipContext = React.createContext<FilterChipContextValue | null>(
  null,
);

function useFilterChip(): FilterChipContextValue {
  const context = React.use(FilterChipContext);
  if (!context) {
    throw new Error("useFilterChip must be used within a FilterChip.");
  }
  return context;
}

export {
  FiltersStateContext,
  FiltersActionsContext,
  useFilters,
  useFiltersState,
  useFiltersActions,
  FilterChipContext,
  FiltersAnnouncementContext,
  useFilterChip,
};
export type {
  FiltersContextValue,
  FiltersStateContextValue,
  FiltersActionsContextValue,
  FilterChipContextValue,
};
