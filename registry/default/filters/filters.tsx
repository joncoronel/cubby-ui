"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/registry/default/badge/badge";
import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/default/button-group/button-group";
import {
  Combobox,
  ComboboxItem,
  ComboboxTrigger,
} from "@/registry/default/combobox/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Kbd } from "@/registry/default/kbd/kbd";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import {
  FilterChipContext,
  FiltersActionsContext,
  FiltersAutoOpenContext,
  FiltersStateContext,
  useFilterChip,
  useFiltersActions,
  useFiltersAutoOpen,
  useFiltersState,
} from "./filters-context";
import { FilterChipValue, FilterSearchPopup } from "./filters-value-controls";
import {
  createFilter,
  describeFilter,
  FILTER_SIZES,
  patchFilter,
  resolveOperators,
} from "./lib/filters-utils";
import type {
  FilterChipProps,
  FilterField,
  FiltersBarProps,
  FiltersLabels,
  FiltersProps,
  FiltersProviderProps,
  FilterValue,
} from "./lib/filters-types";

const DEFAULT_LABELS: FiltersLabels = {
  add: "Add filter",
  clear: "Clear",
  searchFields: "Filter...",
  searchValues: "Search...",
  noFields: "No filters found.",
  noResults: "No results found.",
  selectValue: "Select...",
  enterValue: "Enter value",
  value: "Value",
  min: "Min",
  max: "Max",
  operator: "operator",
  removeFilter: (fieldLabel) => `Remove ${fieldLabel} filter`,
};

const LABEL_KEYS = Object.keys(DEFAULT_LABELS) as (keyof FiltersLabels)[];

/** Small muted wrapper that normalizes field icons to 14px. */
function FieldIcon({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <span className="text-muted-foreground flex shrink-0 items-center [&_svg]:size-3.5!">
      {children}
    </span>
  );
}

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

  // Tracks the freshly added filter so its value control opens on mount. The
  // chip consumes (clears) the flag once mounted, so later remounts of the
  // value control don't spuriously re-open it.
  const [lastAddedId, setLastAddedId] = React.useState<string | null>(null);
  const clearAutoOpen = React.useCallback(() => setLastAddedId(null), []);

  const labels = React.useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    // Value-level deps (constant length — FiltersLabels is a closed shape) so
    // an inline `labels={{ ... }}` object doesn't churn the actions context.
    // Caveat: `removeFilter` is a function, so an inline arrow for it is a
    // new identity every render and still churns; hoist it in that case.
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
      setLastAddedId(filter.id);
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

  // Split contexts: `state` changes per keystroke, `actions` stays stable
  // (so leaves subscribed via useFiltersActions don't re-render while
  // typing), and the transient auto-open signal is isolated so its set/consume
  // cycle per add doesn't churn the actions context either.
  const stateContext = React.useMemo(() => ({ filters }), [filters]);
  const autoOpenContext = React.useMemo(
    () => ({ lastAddedId, clearAutoOpen }),
    [lastAddedId, clearAutoOpen],
  );
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
        <FiltersAutoOpenContext.Provider value={autoOpenContext}>
          {children}
        </FiltersAutoOpenContext.Provider>
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
  className,
  children,
  ...props
}: FiltersBarProps) {
  return (
    <div
      data-slot="filters"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {children ?? (
        <>
          <FilterChips />
          <FilterAddButton shortcut={shortcut} />
          <FilterClearButton />
        </>
      )}
    </div>
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

/** Renders a `FilterChip` for every active filter. */
function FilterChips() {
  const { filters } = useFiltersState();
  const { fieldsById } = useFiltersActions();
  return (
    <>
      {filters.map((filter) => {
        const field = fieldsById.get(filter.field);
        if (!field) return null;
        return <FilterChip key={filter.id} filter={filter} field={field} />;
      })}
    </>
  );
}

// Memoized: chips subscribe only to the stable actions context and untouched
// `filter` objects keep their identity across edits, so typing in one chip's
// value doesn't re-render the others.
const FilterChip = React.memo(function FilterChip({
  filter,
  field: fieldProp,
  className,
  children,
  ...props
}: FilterChipProps) {
  const { size, removeFilter, fieldsById } = useFiltersActions();
  const { lastAddedId, clearAutoOpen } = useFiltersAutoOpen();
  const field = fieldProp ?? fieldsById.get(filter.field);
  const autoOpen = filter.id === lastAddedId;

  // Consume the auto-open flag once this chip has mounted, so later remounts
  // of the value control (e.g. an operator shape change) don't re-open it.
  React.useEffect(() => {
    if (autoOpen) clearAutoOpen();
  }, [autoOpen, clearAutoOpen]);

  const chipContext = React.useMemo(
    () => (field ? { filter, field, size, autoOpen } : null),
    [filter, field, size, autoOpen],
  );

  if (!field || !chipContext) return null;

  return (
    <FilterChipContext.Provider value={chipContext}>
      <ButtonGroup
        data-slot="filter-chip"
        aria-label={describeFilter(field, filter)}
        className={cn(
          "bg-card overflow-hidden rounded-lg border bg-clip-padding",
          className,
        )}
        onKeyDown={(event) => {
          if (event.key !== "Backspace" && event.key !== "Delete") return;
          // Only remove when focus is on one of the chip's own button
          // segments; inputs and custom controls keep their editing keys.
          const target = event.target;
          const isChipButton =
            target instanceof HTMLElement &&
            target.tagName === "BUTTON" &&
            (target.dataset.slot === "filter-chip-value" ||
              target.closest(
                '[data-slot="filter-chip-remove"], [data-slot="filter-chip-operator"]',
              ) !== null);
          if (!isChipButton) return;
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
      </ButtonGroup>
    </FilterChipContext.Provider>
  );
});

function FilterChipField({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { field, size } = useFilterChip();
  return (
    <ButtonGroupText
      data-slot="filter-chip-field"
      className={cn(
        "text-foreground gap-1.5 rounded-none border-0 border-r font-medium",
        FILTER_SIZES[size].fieldLabel,
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
    </ButtonGroupText>
  );
}

function FilterChipOperator({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { filter, field, size } = useFilterChip();
  const { updateFilter, labels } = useFiltersActions();
  const operators = resolveOperators(field);
  const current = operators.find((operator) => operator.id === filter.operator);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            data-slot="filter-chip-operator"
            aria-label={`${field.label} ${labels.operator}: ${current?.label ?? filter.operator}`}
            variant="ghost"
            size={size}
            className={cn(
              "rounded-none! font-normal focus-visible:-outline-offset-2",
              className,
            )}
            {...props}
          />
        }
      >
        {current?.label ?? filter.operator}
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
  ...props
}: React.ComponentProps<typeof Button>) {
  const { filter, field } = useFilterChip();
  const { removeFilter, size, labels } = useFiltersActions();
  return (
    <Button
      data-slot="filter-chip-remove"
      aria-label={labels.removeFilter(field.label)}
      variant="ghost"
      size={FILTER_SIZES[size].iconButton}
      className={cn(
        "text-muted-foreground hover:text-foreground rounded-none focus-visible:-outline-offset-2",
        className,
      )}
      onClick={(event) => {
        focusAdjacentChip(
          event.currentTarget.closest<HTMLElement>('[data-slot="filter-chip"]'),
        );
        removeFilter(filter.id);
      }}
      {...props}
    >
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
    </Button>
  );
}

function FilterAddButton({
  children,
  shortcut,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  /** Key that opens this menu from the keyboard (e.g. `"f"`). */
  shortcut?: string;
}) {
  const {
    fields,
    usedFieldIds,
    allowDuplicateFields,
    addFilter,
    labels,
    size,
  } = useFiltersActions();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!shortcut) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // `defaultPrevented` also dedupes multiple Filters instances: the first
      // listener to accept the key prevents it for the rest.
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target.isContentEditable
        ) {
          return;
        }
        // Don't steal the key from open popups (menu typeahead, dialogs).
        if (
          target.closest(
            '[role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"]',
          )
        ) {
          return;
        }
      }
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut]);

  return (
    <Combobox<FilterField, false>
      items={fields}
      value={null}
      open={open}
      onOpenChange={setOpen}
      onValueChange={(field) => {
        if (field) addFilter(createFilter(field));
      }}
      itemToStringLabel={(field) => field.label}
    >
      <ComboboxTrigger
        render={(triggerProps) => (
          <Button
            {...triggerProps}
            data-slot="filter-add"
            variant="outline"
            size={size}
            className={cn(
              // The border renders on the button's paint pseudo-element, so
              // border style overrides use before: classes.
              "text-muted-foreground gap-1.5 before:border-dashed",
              className,
            )}
            leadingIcon={<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />}
            trailingIcon={
              shortcut ? (
                <Kbd size="sm" variant="ghost" className="ms-1">
                  {shortcut.toUpperCase()}
                </Kbd>
              ) : undefined
            }
            {...props}
          >
            {children ?? labels.add}
          </Button>
        )}
      />
      <FilterSearchPopup
        className="min-w-56"
        placeholder={labels.searchFields}
        empty={labels.noFields}
      >
        {(field: FilterField) => (
          <ComboboxItem
            key={field.id}
            value={field}
            disabled={!allowDuplicateFields && usedFieldIds.has(field.id)}
          >
            <span className="flex items-center gap-2">
              <FieldIcon>{field.icon}</FieldIcon>
              <span className="truncate">{field.label}</span>
            </span>
          </ComboboxItem>
        )}
      </FilterSearchPopup>
    </Combobox>
  );
}

/** Clears every filter. Renders nothing while no filters are active. */
function FilterClearButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { clearAll, labels, size } = useFiltersActions();
  const { filters } = useFiltersState();
  if (filters.length === 0) return null;
  return (
    <Button
      data-slot="filter-clear"
      variant="ghost"
      size={size}
      className={cn("text-muted-foreground gap-1.5", className)}
      onClick={clearAll}
      leadingIcon={<HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />}
      {...props}
    >
      {children ?? labels.clear}
    </Button>
  );
}

function FilterActiveCount({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  const { filters } = useFiltersState();
  return (
    <Badge
      data-slot="filter-active-count"
      variant="neutral"
      className={className}
      {...props}
    >
      {filters.length}
    </Badge>
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
