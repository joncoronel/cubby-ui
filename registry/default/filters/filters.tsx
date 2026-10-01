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

import { FieldIcon, FilterAddButton } from "./filters-add-menu";
import {
  FilterActionsContext,
  FilterChipContext,
  FiltersActionsContext,
  FiltersStateContext,
  useFilterChip,
  useFiltersActions,
  useFiltersState,
} from "./filters-context";
import { FilterChipValue } from "./filters-value-controls";
import {
  CLICK_MORPH_MS,
  describeFilter,
  FILTER_SEGMENT,
  FILTER_SEGMENT_INTERACTIVE,
  FILTER_SIZES,
  formatFilterValue,
  operatorShapeFor,
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
  operator: "operator",
  activeCount: (count) => `${count} active`,
  selectedCount: (count) => `${count} selected`,
  removeFilter: (fieldLabel) => `Remove ${fieldLabel} filter`,
};

const LABEL_KEYS = Object.keys(DEFAULT_LABELS) as (keyof FiltersLabels)[];

/**
 * Moves focus to the adjacent chip's remove button (or the add-filter trigger)
 * before a chip is removed, so focus never falls to `<body>`.
 */
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

/**
 * Owns filter state and provides it via context, without rendering any layout.
 * Wrap it around a `FiltersBar` plus any external UI (a results count, saved
 * views, an apply button) that should share the state through `useFilters`.
 */
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
    // Value-level deps (constant length — FiltersLabels is a closed shape) so
    // an inline `labels={{ ... }}` object doesn't churn the actions context.
    // Caveat: `removeFilter` and `selectedCount` are functions, so an inline
    // arrow for either is a new identity every render and still churns;
    // hoist them in that case.
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

  const addFilter = React.useCallback(
    (filter: FilterValue) => {
      setFilters((prev) => [...prev, filter]);
    },
    [setFilters],
  );
  const removeFilter = React.useCallback(
    (id: string) => setFilters((prev) => prev.filter((f) => f.id !== id)),
    [setFilters],
  );
  const clearAll = React.useCallback(() => setFilters([]), [setFilters]);
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

  // Split contexts: `state` changes per keystroke, `actions` stays stable, so
  // leaves subscribed via useFiltersActions don't re-render while typing.
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
    ],
  );

  return (
    <FiltersStateContext.Provider value={stateContext}>
      <FiltersActionsContext.Provider value={actionsContext}>
        {children}
      </FiltersActionsContext.Provider>
    </FiltersStateContext.Provider>
  );
}

/**
 * The flex row. Renders the default layout unless `children` is passed. Only
 * the default leaves subscribe to filter state, so a bar with custom children
 * doesn't re-render while a value is being typed.
 */
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
      {/* One provider for the bar's tooltips: the registry's snappier delay,
          and moving between neighbours (the add and clear segments) shows
          the next at once. */}
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
        </div>
      </TooltipProvider>
    </FiltersOverflowContext>
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

/**
 * Lets a plain mouse wheel scroll the strip sideways. Only while the strip
 * has somewhere to go in that direction, so at either end (or when nothing
 * overflows) the wheel scrolls the page as usual.
 */
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

/**
 * Renders a `FilterChip` for every active filter. Inside a scrolling bar the
 * chips sit in their own strip that scrolls sideways behind edge fades, so
 * the buttons after it stay in view; the strip hides itself when empty, so
 * it adds no gap to the bar.
 */
function FilterChips() {
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
      // Not a tab stop of its own: every chip in it is, and the browser
      // scrolls a focused chip into view.
      tabIndex={-1}
      // The 2px inset keeps chip edges off the strip's clip line, where a
      // fractional pixel ratio would shave their border; the matching
      // negative margin keeps the bar's layout unchanged.
      className="-m-0.5 flex size-auto min-w-0 items-center gap-2 overflow-y-hidden rounded-none p-0.5 *:max-w-none empty:not-data-flow-busy:hidden"
    >
      {chips}
    </ScrollArea>
  );
}

// Chip segments that are buttons, where Backspace and Delete remove the chip.
// Inputs and custom controls keep those keys for editing.
const REMOVABLE_FROM = new Set([
  "filter-chip-operator",
  "filter-chip-value",
  "filter-chip-remove",
]);

// Memoized: chips subscribe only to the stable actions context and untouched
// `filter` objects keep their identity across edits, so typing in one chip's
// value doesn't re-render the others.
const FilterChip = React.memo(function FilterChip({
  filter,
  field: fieldProp,
  className,
  children,
  ref,
  ...props
}: FilterChipProps) {
  const { size, removeFilter, fieldsById } = useFiltersActions();
  const presenceRef = useFlowPresence(ref);
  const field = fieldProp ?? fieldsById.get(filter.field);

  const chipContext = React.useMemo(
    () => (field ? { filter, field, size } : null),
    [filter, field, size],
  );

  if (!field || !chipContext) return null;

  // A chip still waiting on its value narrows nothing yet; its dashed edge
  // says so without an extra word.
  const incomplete =
    operatorShapeFor(field, filter.operator) !== "none" &&
    formatFilterValue(field, filter) === "";

  return (
    <FilterChipContext.Provider value={chipContext}>
      <div
        ref={presenceRef}
        role="group"
        data-slot="filter-chip"
        data-filter-id={filter.id}
        data-incomplete={incomplete ? "" : undefined}
        aria-label={describeFilter(field, filter)}
        className={cn(
          "bg-card text-foreground inline-flex max-w-full shrink-0 items-center gap-0.5 rounded-lg border bg-clip-padding p-0.5",
          "transition-[border-color] duration-150 data-incomplete:border-dashed",
          FILTER_SIZES[size],
          className,
        )}
        onKeyDown={(event) => {
          if (event.key !== "Backspace" && event.key !== "Delete") return;
          const target = event.target;
          if (
            !(target instanceof HTMLButtonElement) ||
            !REMOVABLE_FROM.has(target.dataset.slot ?? "")
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
  const label = current?.label ?? filter.operator;

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
              {operator.label}
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
        // The chips are about to go; keep focus on the bar.
        event.currentTarget
          .closest('[data-slot="filters"]')
          ?.querySelector<HTMLElement>('[data-slot="filter-add"]')
          ?.focus();
        clearAll();
      }}
      {...props}
    >
      {children ?? labels.clear}
    </Button>
  );
}

/**
 * The add and clear actions as one capsule, built like a chip: the add
 * button as a segment, then, while filters exist, a hairline and a clear
 * segment. The clear segment opens in the same beat as the add button's
 * label folds away.
 */
function FilterActions({
  shortcut,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** Key that opens the add menu from the keyboard (e.g. `"f"`). */
  shortcut?: string;
}) {
  const { size } = useFiltersActions();
  return (
    <FilterActionsContext value={true}>
      <div
        role="group"
        data-slot="filter-actions"
        className={cn(
          // No gap: a folded clear segment would still get one, leaving the
          // add segment off-centre. The clear segment brings its own.
          "bg-card text-foreground inline-flex shrink-0 items-center rounded-lg border bg-clip-padding p-0.5",
          FILTER_SIZES[size],
          className,
        )}
        {...props}
      >
        <FilterAddButton shortcut={shortcut} />
        <FilterClearSegment />
      </div>
    </FilterActionsContext>
  );
}

/**
 * The capsule's clear segment. Always rendered, folded through a grid column
 * (and inert) while no filters exist, so it opens and closes with the same
 * CSS-only motion as the add button's label.
 */
function FilterClearSegment() {
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
        {/* Sets clear-all apart from add, its neighbour in the capsule. */}
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
                )}
                onClick={(event) => {
                  // The chips are about to go; keep focus on the bar.
                  event.currentTarget
                    .closest('[data-slot="filter-actions"]')
                    ?.querySelector<HTMLElement>('[data-slot="filter-add"]')
                    ?.focus();
                  clearAll();
                }}
              />
            }
          >
            <HugeiconsIcon icon={FilterRemoveIcon} strokeWidth={2} />
          </TooltipTrigger>
          <TooltipContent>{labels.clear}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

/**
 * The number of active filters as plain muted text ("3 active"), with the
 * number morphing as it changes. Status rather than an object, so it doesn't
 * read as one more chip in the row.
 */
function FilterActiveCount({
  className,
  ref,
  ...props
}: React.ComponentProps<"span">) {
  const { filters } = useFiltersState();
  const { labels } = useFiltersActions();
  const presenceRef = useFlowPresence(ref);
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
      <TextMorph
        value={labels.activeCount(filters.length)}
        duration={CLICK_MORPH_MS}
      />
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
  isValuelessOperator,
  emptyValueFor,
  formatFilterValue,
  describeFilter,
  asFilterValues,
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
