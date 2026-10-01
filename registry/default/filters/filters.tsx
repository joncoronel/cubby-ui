"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, FilterRemoveIcon } from "@hugeicons/core-free-icons";

import {
  FieldIcon,
  FilterActionsAdd,
  FilterAddButton,
} from "./filters-add-menu";
import {
  FilterChipContext,
  FiltersActionsContext,
  FiltersAnnouncementContext,
  FiltersStateContext,
  useFilterChip,
  useFiltersActions,
  useFiltersState,
} from "./filters-context";
import { FilterChipValue } from "./filters-value-controls";
import {
  CLICK_MORPH_MS,
  describeFilter,
  isFilterComplete,
  operatorLabel,
  FILTER_SEGMENT,
  FILTER_SEGMENT_INTERACTIVE,
  FILTER_SIZES,
  patchFilter,
  resolveOperators,
} from "./lib/filters-utils";
import { useFlowPresence, useFlowRow } from "./lib/flow-presence";
import type {
  FilterChipProps,
  FiltersBarProps,
  FiltersLabels,
  FiltersOverflow,
  FiltersProps,
  FiltersProviderProps,
  FilterValue,
} from "./lib/filters-types";

const DEFAULT_LABELS: FiltersLabels = {
  add: "Filter",
  addTooltip: "Add filter",
  clear: "Clear filters",
  searchFields: "Filter by...",
  searchValues: "Search...",
  noFields: "No matches.",
  noResults: "No results found.",
  selectValue: "Select...",
  enterValue: "Enter value",
  value: "Value",
  min: "Min",
  max: "Max",
  and: "and",
  fields: "Fields",
  values: "Values",
  back: "Back to fields",
  done: "Done",
  invalidNumber: "Enter a number",
  filtersCleared: "Cleared all filters",
  operator: "operator",
  operators: {},
  activeCount: (count) => `${count} active`,
  selectedCount: (count) => `${count} selected`,
  removeFilter: (fieldLabel) => `Remove ${fieldLabel} filter`,
  filterAdded: (description) => `Added ${description}`,
  filterRemoved: (description) => `Removed ${description}`,
};

const LABEL_KEYS = Object.keys(DEFAULT_LABELS) as (keyof FiltersLabels)[];

/** Moves focus to the add button first: the chips and clear control are about to unmount. */
function clearFromBar(from: HTMLElement, clearAll: () => void) {
  from
    .closest('[data-slot="filters"]')
    ?.querySelector<HTMLElement>('[data-slot="filter-add"]')
    ?.focus();
  clearAll();
}

/** Refocuses a neighbouring chip (or the add button) before removal so focus never falls to `<body>`. */
function focusAdjacentChip(chip: HTMLElement | null) {
  const bar = chip?.closest<HTMLElement>('[data-slot="filters"]');
  if (!chip || !bar) return;
  const chips = Array.from(
    bar.querySelectorAll<HTMLElement>('[data-slot="filter-chip"]'),
  );
  const index = chips.indexOf(chip);
  const neighbor = chips[index + 1] ?? chips[index - 1];
  const target =
    neighbor?.querySelector<HTMLElement>('[data-slot="filter-chip-remove"]') ??
    bar.querySelector<HTMLElement>('[data-slot="filter-add"]');
  target?.focus();
}

/** Owns filter state with no layout; wrap a `FiltersBar` plus any external UI that reads `useFilters`. */
function FiltersProvider({
  fields,
  value,
  defaultValue = [],
  onValueChange,
  size = "default",
  allowDuplicateFields = false,
  labels: labelsProp,
  children,
}: FiltersProviderProps) {
  const [filters, setFilters] = useControllableState<FilterValue[]>({
    value,
    defaultValue,
    onValueChange,
  });

  const labels = React.useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    // Value-level deps so an inline `labels` object doesn't churn the actions
    // context. Inline function labels still churn; hoist those.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    LABEL_KEYS.map((key) => labelsProp?.[key]),
  );
  const fieldsById = React.useMemo(
    () => new Map(fields.map((field) => [field.id, field])),
    [fields],
  );
  // Keyed by content (not the filters array identity) so the Set stays
  // referentially stable while a filter's value is being typed.
  const usedFieldsKey = filters
    .map((filter) => filter.field)
    .sort()
    .join("\u0000");
  const usedFieldIds = React.useMemo(
    () => new Set(usedFieldsKey ? usedFieldsKey.split("\u0000") : []),
    [usedFieldsKey],
  );

  // Adds/removes/clears are announced because focus lands elsewhere; edits
  // aren't, since their own controls already say what changed.
  const [announcement, setAnnouncement] = React.useState({
    text: "",
    count: 0,
  });
  const announce = React.useCallback(
    (text: string) =>
      setAnnouncement((previous) => ({ text, count: previous.count + 1 })),
    [],
  );
  // The filters as of the last commit, for describing the one removed.
  const filtersRef = React.useRef(filters);
  React.useLayoutEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  const describe = React.useCallback(
    (filter: FilterValue | undefined) => {
      const field = filter && fieldsById.get(filter.field);
      return field && filter
        ? describeFilter(field, filter, labels.operators)
        : "";
    },
    [fieldsById, labels],
  );

  const addFilter = React.useCallback(
    (filter: FilterValue) => {
      setFilters((prev) => [...prev, filter]);
      announce(labels.filterAdded(describe(filter)));
    },
    [setFilters, announce, labels, describe],
  );
  const removeFilter = React.useCallback(
    (id: string) => {
      const removed = filtersRef.current.find((filter) => filter.id === id);
      setFilters((prev) => prev.filter((f) => f.id !== id));
      if (removed) announce(labels.filterRemoved(describe(removed)));
    },
    [setFilters, announce, labels, describe],
  );
  const getFilters = React.useCallback(() => filtersRef.current, []);
  const clearAll = React.useCallback(() => {
    setFilters([]);
    announce(labels.filtersCleared);
  }, [setFilters, announce, labels]);
  const updateFilter = React.useCallback(
    (id: string, patch: Partial<Omit<FilterValue, "id">>) => {
      setFilters((prev) =>
        prev.map((filter) =>
          filter.id === id
            ? patchFilter(fieldsById.get(filter.field), filter, patch)
            : filter,
        ),
      );
    },
    [setFilters, fieldsById],
  );

  // Split so useFiltersActions leaves don't re-render per keystroke.
  const stateContext = React.useMemo(() => ({ filters }), [filters]);
  const actionsContext = React.useMemo(
    () => ({
      fields,
      size,
      labels,
      fieldsById,
      usedFieldIds,
      allowDuplicateFields,
      addFilter,
      updateFilter,
      removeFilter,
      clearAll,
      getFilters,
    }),
    [
      fields,
      size,
      labels,
      fieldsById,
      usedFieldIds,
      allowDuplicateFields,
      addFilter,
      updateFilter,
      removeFilter,
      clearAll,
      getFilters,
    ],
  );

  return (
    <FiltersStateContext.Provider value={stateContext}>
      <FiltersActionsContext.Provider value={actionsContext}>
        <FiltersAnnouncementContext value={announcement}>
          {children}
        </FiltersAnnouncementContext>
      </FiltersActionsContext.Provider>
    </FiltersStateContext.Provider>
  );
}

/** The flex row; renders the default chips + actions unless `children` is passed. */
function FiltersBar({
  shortcut,
  overflow = "scroll",
  className,
  children,
  ref,
  ...props
}: FiltersBarProps) {
  const rowRef = useFlowRow(ref);
  return (
    <FiltersOverflowContext value={overflow}>
      {/* Shared so moving between the add and clear tooltips skips the delay. */}
      <TooltipProvider>
        <div
          ref={rowRef}
          data-slot="filters"
          data-overflow={overflow}
          className={cn(
            "flex max-w-full items-center gap-2",
            overflow === "wrap" && "flex-wrap",
            className,
          )}
          {...props}
        >
          {children ?? (
            <>
              <FilterChips />
              <FilterActions shortcut={shortcut} />
            </>
          )}
          <FiltersAnnouncer />
        </div>
      </TooltipProvider>
    </FiltersOverflowContext>
  );
}

// Always mounted so screen readers are listening before the first change; the
// alternating nbsp makes a repeated message still count as a change.
function FiltersAnnouncer() {
  const { text, count } = React.use(FiltersAnnouncementContext);
  return (
    <span role="status" className="sr-only">
      {text}
      {count % 2 === 1 ? "\u00a0" : ""}
    </span>
  );
}

/** `FiltersProvider` + `FiltersBar` in one component, for the common case. */
function Filters({
  fields,
  value,
  defaultValue,
  onValueChange,
  size,
  allowDuplicateFields,
  labels,
  ...barProps
}: FiltersProps) {
  return (
    <FiltersProvider
      fields={fields}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      size={size}
      allowDuplicateFields={allowDuplicateFields}
      labels={labels}
    >
      <FiltersBar {...barProps} />
    </FiltersProvider>
  );
}

/** The enclosing bar's overflow mode; chips outside a bar just lay out flat. */
const FiltersOverflowContext = React.createContext<FiltersOverflow>("wrap");

// Vertical wheel scrolls the strip sideways, but only while it can move that
// way, so at either end the page scrolls as usual.
function scrollSidewaysOnWheel(node: HTMLDivElement | null) {
  if (!node) return;
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
      return;
    }
    const range = node.scrollWidth - node.clientWidth;
    if (range <= 1) return;
    // RTL scrolls from 0 towards negative values.
    const direction = getComputedStyle(node).direction === "rtl" ? -1 : 1;
    const position = node.scrollLeft * direction;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : 1);
    if ((delta < 0 && position <= 0) || (delta > 0 && position >= range - 1)) {
      return;
    }
    event.preventDefault();
    node.scrollLeft += delta * direction;
  };
  node.addEventListener("wheel", handleWheel, { passive: false });
  return () => node.removeEventListener("wheel", handleWheel);
}

/** A `FilterChip` per active filter; in a scrolling bar, inside a sideways-scrolling strip. */
function FilterChips({
  className,
}: {
  /** Merged into the scroll strip (a scrolling bar only). */
  className?: string;
}) {
  const { filters } = useFiltersState();
  const { fieldsById } = useFiltersActions();
  const overflow = React.use(FiltersOverflowContext);
  const chips = filters.map((filter) => {
    const field = fieldsById.get(filter.field);
    if (!field) return null;
    return <FilterChip key={filter.id} filter={filter} field={field} />;
  });

  if (overflow === "wrap") return <>{chips}</>;

  return (
    <ScrollArea
      nativeScroll
      hideScrollbar
      fadeEdges="x"
      viewportRef={scrollSidewaysOnWheel}
      // Chips are tab stops and get scrolled into view, so the strip isn't one.
      tabIndex={-1}
      // 2px inset keeps chip borders off the clip line (fractional DPR shaves
      // them); the negative margin cancels it. `empty:` hides the strip's gap.
      className={cn(
        "-m-0.5 flex size-auto min-w-0 items-center gap-2 overflow-y-hidden rounded-none p-0.5 *:max-w-none empty:not-data-flow-busy:hidden",
        className,
      )}
    >
      {chips}
    </ScrollArea>
  );
}

// Memoized so typing in one chip doesn't re-render the others (untouched
// `filter` objects keep their identity; only the stable actions context is read).
const FilterChip = React.memo(function FilterChip({
  filter,
  field: fieldProp,
  className,
  children,
  ref,
  onKeyDown,
  ...props
}: FilterChipProps) {
  const { size, removeFilter, fieldsById, labels } = useFiltersActions();
  const presenceRef = useFlowPresence(ref);
  const field = fieldProp ?? fieldsById.get(filter.field);

  const chipContext = React.useMemo(
    () => (field ? { filter, field, size } : null),
    [filter, field, size],
  );

  if (!field || !chipContext) return null;

  const incomplete = !isFilterComplete(field, filter);

  return (
    <FilterChipContext.Provider value={chipContext}>
      <div
        ref={presenceRef}
        role="group"
        data-slot="filter-chip"
        data-size={size}
        data-filter-id={filter.id}
        data-incomplete={incomplete ? "" : undefined}
        aria-label={describeFilter(field, filter, labels.operators)}
        className={cn(
          "bg-card text-foreground inline-flex max-w-full shrink-0 items-center gap-0.5 rounded-lg border bg-clip-padding p-0.5",
          "transition-[border-color] duration-150 data-incomplete:border-dashed",
          FILTER_SIZES[size],
          className,
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key !== "Backspace" && event.key !== "Delete") return;
          const target = event.target;
          // Remove button only: elsewhere the key means editing that part.
          if (
            !(target instanceof HTMLButtonElement) ||
            target.dataset.slot !== "filter-chip-remove"
          ) {
            return;
          }
          event.preventDefault();
          focusAdjacentChip(event.currentTarget);
          removeFilter(filter.id);
        }}
        {...props}
      >
        {children ?? (
          <>
            <FilterChipField />
            <FilterChipOperator />
            <FilterChipValue />
            <FilterChipRemove />
          </>
        )}
      </div>
    </FilterChipContext.Provider>
  );
});

function FilterChipField({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { field } = useFilterChip();
  return (
    <span
      data-slot="filter-chip-field"
      className={cn(
        "text-muted-foreground inline-flex h-full shrink-0 items-center gap-1.5 ps-(--seg-x) pe-1 whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <FieldIcon>{field.icon}</FieldIcon>
          {field.label}
        </>
      )}
    </span>
  );
}

function FilterChipOperator({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { filter, field } = useFilterChip();
  const { updateFilter, labels } = useFiltersActions();
  const operators = resolveOperators(field);
  const current = operators.find((operator) => operator.id === filter.operator);
  const label = current
    ? operatorLabel(current, labels.operators)
    : filter.operator;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            data-slot="filter-chip-operator"
            aria-label={`${field.label} ${labels.operator}: ${label}`}
            className={cn(
              FILTER_SEGMENT,
              FILTER_SEGMENT_INTERACTIVE,
              "text-muted-foreground hover:text-foreground data-popup-open:text-foreground px-[calc(var(--seg-x)*0.6)]",
              className,
            )}
            {...props}
          />
        }
      >
        <TextMorph value={label} split="word" duration={CLICK_MORPH_MS} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuRadioGroup
          value={filter.operator}
          onValueChange={(next) => updateFilter(filter.id, { operator: next })}
        >
          {operators.map((operator) => (
            <DropdownMenuRadioItem key={operator.id} value={operator.id}>
              {operatorLabel(operator, labels.operators)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterChipRemove({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { filter, field } = useFilterChip();
  const { removeFilter, labels } = useFiltersActions();
  return (
    <button
      type="button"
      data-slot="filter-chip-remove"
      aria-label={labels.removeFilter(field.label)}
      className={cn(
        FILTER_SEGMENT,
        FILTER_SEGMENT_INTERACTIVE,
        "text-muted-foreground hover:text-foreground aspect-square justify-center px-0 [&_svg]:size-3.5",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        focusAdjacentChip(
          event.currentTarget.closest<HTMLElement>('[data-slot="filter-chip"]'),
        );
        removeFilter(filter.id);
      }}
      {...props}
    >
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
    </button>
  );
}

/** Clears every filter. Renders nothing while no filters are active. */
function FilterClearButton({
  className,
  children,
  ref,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { clearAll, labels, size } = useFiltersActions();
  const { filters } = useFiltersState();
  const presenceRef = useFlowPresence(ref);
  if (filters.length === 0) return null;
  return (
    <Button
      ref={presenceRef}
      data-slot="filter-clear"
      variant="ghost"
      size={size}
      className={cn("text-muted-foreground", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        clearFromBar(event.currentTarget, clearAll);
      }}
      {...props}
    >
      {children ?? labels.clear}
    </Button>
  );
}

/** The add and clear actions as one chip-like capsule. */
function FilterActions({
  shortcut,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Key that opens the add menu from the keyboard (e.g. `"f"`). */
  shortcut?: string;
}) {
  const { size } = useFiltersActions();
  return (
    <div
      role="group"
      data-slot="filter-actions"
      data-size={size}
      className={cn(
        // No gap: a folded clear segment would still get one; it brings its own.
        "bg-card text-foreground inline-flex shrink-0 items-center rounded-lg border bg-clip-padding p-0.5",
        FILTER_SIZES[size],
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <FilterActionsAdd shortcut={shortcut} />
          <FilterActionsClear />
        </>
      )}
    </div>
  );
}

/** The capsule's clear segment; stays mounted, folded and inert while no filters exist. */
function FilterActionsClear({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { clearAll, labels, usedFieldIds } = useFiltersActions();
  const active = usedFieldIds.size > 0;
  return (
    <div
      data-slot="filter-clear-segment"
      data-active={active ? "" : undefined}
      inert={!active}
      className="grid h-full grid-cols-[minmax(0,0fr)] overflow-hidden opacity-0 transition-[grid-template-columns,opacity] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] data-active:grid-cols-[minmax(0,1fr)] data-active:opacity-100 motion-reduce:transition-none"
    >
      <div className="flex h-full min-w-0 items-center gap-0.5 ps-0.5">
        <span
          aria-hidden
          className="bg-border my-1.5 w-px shrink-0 self-stretch"
        />
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                data-slot="filter-clear"
                aria-label={labels.clear}
                className={cn(
                  FILTER_SEGMENT,
                  FILTER_SEGMENT_INTERACTIVE,
                  "text-muted-foreground hover:text-foreground aspect-square justify-center px-0 [&_svg]:size-4",
                  className,
                )}
                {...props}
                onClick={(event) => {
                  onClick?.(event);
                  if (event.defaultPrevented) return;
                  clearFromBar(event.currentTarget, clearAll);
                }}
              />
            }
          >
            {children ?? (
              <HugeiconsIcon icon={FilterRemoveIcon} strokeWidth={2} />
            )}
          </TooltipTrigger>
          <TooltipContent>{labels.clear}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

/** Muted "3 active" text counting complete filters only; renders nothing at zero. */
function FilterActiveCount({
  className,
  ref,
  ...props
}: React.ComponentProps<"span">) {
  const { filters } = useFiltersState();
  const { labels, fieldsById } = useFiltersActions();
  const presenceRef = useFlowPresence(ref);
  // Skips filters whose field is gone (a stale URL, say).
  const count = filters.filter((filter) => {
    const field = fieldsById.get(filter.field);
    return field !== undefined && isFilterComplete(field, filter);
  }).length;
  if (count === 0) return null;
  return (
    <span
      ref={presenceRef}
      data-slot="filter-active-count"
      className={cn(
        "text-muted-foreground shrink-0 text-sm whitespace-nowrap tabular-nums",
        className,
      )}
      {...props}
    >
      <TextMorph value={labels.activeCount(count)} duration={CLICK_MORPH_MS} />
    </span>
  );
}

export {
  Filters,
  FiltersProvider,
  FiltersBar,
  FilterChips,
  FilterChip,
  FilterChipField,
  FilterChipOperator,
  FilterChipValue,
  FilterChipRemove,
  FilterAddButton,
  FilterActions,
  FilterActionsAdd,
  FilterActionsClear,
  FilterClearButton,
  FilterActiveCount,
};
export {
  useFilters,
  useFiltersState,
  useFiltersActions,
  useFilterChip,
} from "./filters-context";
export {
  createFilter,
  patchFilter,
  resolveOperators,
  scalarOperatorFor,
  withOption,
  defaultOperatorsFor,
  operatorShape,
  operatorShapeFor,
  emptyValueFor,
  formatFilterValue,
  describeFilter,
  isFilterComplete,
  operatorLabel,
  asFilterValues,
  FILTER_SEGMENT,
  FILTER_SEGMENT_INTERACTIVE,
} from "./lib/filters-utils";
export type {
  FilterField,
  FilterFieldType,
  FilterOption,
  FilterOperator,
  FilterOperatorShape,
  FilterValue,
  FilterSize,
  FiltersLabels,
  FiltersOverflow,
  FiltersProps,
  FiltersProviderProps,
  FiltersBarProps,
  FilterChipProps,
  FilterValueControlProps,
  NumberRange,
  SelectFilterField,
  MultiSelectFilterField,
  TextFilterField,
  NumberFilterField,
  CustomFilterField,
} from "./lib/filters-types";
