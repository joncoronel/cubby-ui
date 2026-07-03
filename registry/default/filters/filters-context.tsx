"use client";

import * as React from "react";

import type {
  FilterField,
  FilterSize,
  FilterValue,
  FiltersLabels,
} from "./lib/filters-types";

/**
 * Fast-changing state: `filters` gets a new identity on every edit (including
 * each keystroke in a text or number filter). Subscribe only when you render
 * the filters themselves.
 */
interface FiltersStateContextValue {
  filters: FilterValue[];
}

/**
 * Configuration and actions. Referentially stable across value edits (it only
 * changes when the field config changes or a filter is added/removed), so
 * leaves like the add/clear buttons and memoized chips can subscribe without
 * re-rendering per keystroke.
 */
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
}

/**
 * The transient auto-open signal, isolated in its own context so the two
 * invalidations per add (set, then consume) don't churn the actions context.
 */
interface FiltersAutoOpenContextValue {
  /** Id of the most recently added filter, used to auto-open its value control. */
  lastAddedId: string | null;
  /** Clears `lastAddedId`; called by the freshly added chip once it mounts. */
  clearAutoOpen: () => void;
}

type FiltersContextValue = FiltersStateContextValue &
  FiltersActionsContextValue &
  FiltersAutoOpenContextValue;

const FiltersStateContext =
  React.createContext<FiltersStateContextValue | null>(null);
const FiltersActionsContext =
  React.createContext<FiltersActionsContextValue | null>(null);
const FiltersAutoOpenContext =
  React.createContext<FiltersAutoOpenContextValue | null>(null);

/** The bar's fast-changing state (`filters`). Re-renders on every edit. */
function useFiltersState(): FiltersStateContextValue {
  const context = React.useContext(FiltersStateContext);
  if (!context) {
    throw new Error("useFiltersState must be used within a FiltersProvider.");
  }
  return context;
}

/** The bar's config and actions. Stable while a filter value is being edited. */
function useFiltersActions(): FiltersActionsContextValue {
  const context = React.useContext(FiltersActionsContext);
  if (!context) {
    throw new Error("useFiltersActions must be used within a FiltersProvider.");
  }
  return context;
}

/** The auto-open signal for freshly added chips. */
function useFiltersAutoOpen(): FiltersAutoOpenContextValue {
  const context = React.useContext(FiltersAutoOpenContext);
  if (!context) {
    throw new Error(
      "useFiltersAutoOpen must be used within a FiltersProvider.",
    );
  }
  return context;
}

/**
 * Everything from all contexts. Convenient, but re-renders on every filter
 * edit; subscribe to `useFiltersActions` alone when that matters.
 */
function useFilters(): FiltersContextValue {
  const state = useFiltersState();
  const actions = useFiltersActions();
  const autoOpen = useFiltersAutoOpen();
  return React.useMemo(
    () => ({ ...state, ...actions, ...autoOpen }),
    [state, actions, autoOpen],
  );
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
  FiltersStateContext,
  FiltersActionsContext,
  FiltersAutoOpenContext,
  useFilters,
  useFiltersState,
  useFiltersActions,
  useFiltersAutoOpen,
  FilterChipContext,
  useFilterChip,
};
export type {
  FiltersContextValue,
  FiltersStateContextValue,
  FiltersActionsContextValue,
  FiltersAutoOpenContextValue,
  FilterChipContextValue,
};
