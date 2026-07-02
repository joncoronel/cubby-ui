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
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
} from "@/registry/default/combobox/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Input } from "@/registry/default/input/input";
import { Kbd } from "@/registry/default/kbd/kbd";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

import {
  FilterChipContext,
  FiltersContext,
  useFilterChip,
  useFilters,
} from "./filters-context";
import {
  createFilter,
  emptyValueFor,
  isValuelessOperator,
  resolveOperators,
  valueShape,
} from "./lib/filters-utils";
import type {
  FilterChipProps,
  FilterField,
  FilterOption,
  FiltersLabels,
  FiltersProps,
  FilterSize,
  FilterValue,
  MultiSelectFilterField,
  NumberFilterField,
  NumberRange,
  SelectFilterField,
  TextFilterField,
} from "./lib/filters-types";
import { useControllableState } from "./hooks/use-controllable-state";

const DEFAULT_LABELS: FiltersLabels = {
  add: "Add filter",
  clear: "Clear",
  searchFields: "Filter...",
  searchValues: "Search...",
  noFields: "No filters found.",
  noResults: "No results found.",
  selectValue: "Select...",
};

function iconButtonSize(size: FilterSize): "icon_sm" | "icon" | "icon_lg" {
  return size === "sm" ? "icon_sm" : size === "lg" ? "icon_lg" : "icon";
}

function isNumberRange(value: unknown): value is NumberRange {
  return typeof value === "object" && value !== null && "min" in value;
}

/** Builds a plain-language summary of a filter for screen readers. */
function describeFilter(field: FilterField, filter: FilterValue): string {
  const operatorLabel =
    resolveOperators(field).find((operator) => operator.id === filter.operator)
      ?.label ?? filter.operator;
  if (isValuelessOperator(field, filter.operator)) {
    return `${field.label} ${operatorLabel}`;
  }

  let summary = "";
  switch (field.type) {
    case "select":
      summary =
        field.options.find((option) => option.value === filter.value)?.label ??
        "";
      break;
    case "multiselect": {
      const values = Array.isArray(filter.value)
        ? (filter.value as string[])
        : [];
      summary = field.options
        .filter((option) => values.includes(option.value))
        .map((option) => option.label)
        .join(", ");
      break;
    }
    case "text":
      summary = typeof filter.value === "string" ? filter.value : "";
      break;
    case "number":
      if (isNumberRange(filter.value)) {
        summary = `${filter.value.min ?? ""} to ${filter.value.max ?? ""}`.trim();
      } else if (typeof filter.value === "number") {
        summary = String(filter.value);
      }
      break;
  }

  return summary
    ? `${field.label} ${operatorLabel} ${summary}`
    : `${field.label} ${operatorLabel}`;
}

function Filters({
  fields,
  value,
  defaultValue = [],
  onValueChange,
  size = "default",
  addLabel,
  showClear = true,
  showActiveCount = false,
  allowDuplicateFields = false,
  enableShortcut = false,
  shortcutKey = "f",
  shortcutLabel,
  labels: labelsProp,
  className,
  children,
  ...props
}: FiltersProps) {
  const [filters, setFilters] = useControllableState<FilterValue[]>({
    value,
    defaultValue,
    onValueChange,
  });

  // Tracks the freshly added filter so its value control can open on mount.
  const [lastAddedId, setLastAddedId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!lastAddedId) return;
    const timer = setTimeout(() => setLastAddedId(null), 500);
    return () => clearTimeout(timer);
  }, [lastAddedId]);

  const labels = React.useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp],
  );
  const fieldsById = React.useMemo(
    () => new Map(fields.map((field) => [field.id, field])),
    [fields],
  );
  const usedFieldIds = React.useMemo(
    () => new Set(filters.map((filter) => filter.field)),
    [filters],
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
        prev.map((filter) => {
          if (filter.id !== id) return filter;
          const next: FilterValue = { ...filter, ...patch };
          const operatorChanged =
            patch.operator !== undefined && patch.operator !== filter.operator;
          if (operatorChanged && !("value" in patch)) {
            const field = fieldsById.get(filter.field);
            if (
              field &&
              valueShape(field, filter.operator) !==
                valueShape(field, next.operator)
            ) {
              next.value = emptyValueFor(field, next.operator);
            }
          }
          return next;
        }),
      );
    },
    [setFilters, fieldsById],
  );

  const context = React.useMemo(
    () => ({
      fields,
      filters,
      size,
      labels,
      fieldsById,
      usedFieldIds,
      allowDuplicateFields,
      enableShortcut,
      shortcutKey,
      shortcutLabel: shortcutLabel ?? shortcutKey.toUpperCase(),
      lastAddedId,
      addFilter,
      updateFilter,
      removeFilter,
      clearAll,
    }),
    [
      fields,
      filters,
      size,
      labels,
      fieldsById,
      usedFieldIds,
      allowDuplicateFields,
      enableShortcut,
      shortcutKey,
      shortcutLabel,
      lastAddedId,
      addFilter,
      updateFilter,
      removeFilter,
      clearAll,
    ],
  );

  return (
    <FiltersContext.Provider value={context}>
      <div
        data-slot="filters"
        className={cn("flex flex-wrap items-center gap-2", className)}
        {...props}
      >
        {children ?? (
          <>
            {filters.map((filter) => {
              const field = fieldsById.get(filter.field);
              if (!field) return null;
              return (
                <FilterChip key={filter.id} filter={filter} field={field} />
              );
            })}
            <FilterAddButton>{addLabel}</FilterAddButton>
            {showActiveCount && filters.length > 0 && <FilterActiveCount />}
            {showClear && filters.length > 0 && <FilterClearButton />}
          </>
        )}
      </div>
    </FiltersContext.Provider>
  );
}

function FilterChip({ filter, field, className, ...props }: FilterChipProps) {
  const { size, lastAddedId, removeFilter } = useFilters();
  const valueless = isValuelessOperator(field, filter.operator);
  const autoOpen = filter.id === lastAddedId;
  const chipContext = React.useMemo(
    () => ({ filter, field, size, autoOpen }),
    [filter, field, size, autoOpen],
  );

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
          if (
            (event.key === "Backspace" || event.key === "Delete") &&
            !(event.target instanceof HTMLInputElement)
          ) {
            event.preventDefault();
            removeFilter(filter.id);
          }
        }}
        {...props}
      >
        <FilterChipField />
        <FilterChipOperator />
        {!valueless && <FilterChipValue />}
        <FilterChipRemove />
      </ButtonGroup>
    </FilterChipContext.Provider>
  );
}

function FilterChipField() {
  const { field, size } = useFilterChip();
  return (
    <ButtonGroupText
      data-slot="filter-chip-field"
      className={cn(
        "text-foreground gap-1.5 rounded-none border-0 border-r font-medium",
        size === "sm" ? "px-2.5 text-xs" : size === "lg" ? "px-4" : "px-3",
      )}
    >
      {field.icon ? (
        <span className="text-muted-foreground flex shrink-0 items-center [&_svg]:size-3.5!">
          {field.icon}
        </span>
      ) : null}
      {field.label}
    </ButtonGroupText>
  );
}

function FilterChipOperator() {
  const { filter, field, size } = useFilterChip();
  const { updateFilter } = useFilters();
  const operators = resolveOperators(field);
  const current = operators.find((operator) => operator.id === filter.operator);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            data-slot="filter-chip-operator"
            variant="ghost"
            size={size}
            className="data-popup-open:bg-surface-hover data-popup-open:text-foreground rounded-none! font-normal focus-visible:-outline-offset-2"
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

function FilterChipValue() {
  const { field, filter, size, autoOpen } = useFilterChip();
  const { updateFilter } = useFilters();
  const onValueChange = React.useCallback(
    (nextValue: unknown) => updateFilter(filter.id, { value: nextValue }),
    [updateFilter, filter.id],
  );

  switch (field.type) {
    case "select":
      return (
        <SelectValueControl
          field={field}
          filter={filter}
          size={size}
          autoOpen={autoOpen}
          onValueChange={onValueChange}
        />
      );
    case "multiselect":
      return (
        <MultiSelectValueControl
          field={field}
          filter={filter}
          size={size}
          autoOpen={autoOpen}
          onValueChange={onValueChange}
        />
      );
    case "text":
      return (
        <TextValueControl
          field={field}
          filter={filter}
          size={size}
          autoOpen={autoOpen}
          onValueChange={onValueChange}
        />
      );
    case "number":
      return (
        <NumberValueControl
          field={field}
          filter={filter}
          size={size}
          autoOpen={autoOpen}
          onValueChange={onValueChange}
        />
      );
    case "custom":
      return (
        <div data-slot="filter-chip-value" className="flex items-stretch">
          {field.renderValue({
            value: filter.value,
            operator: filter.operator,
            onValueChange,
            size,
            field,
          })}
        </div>
      );
    default:
      return null;
  }
}

interface ValueControlProps<F extends FilterField> {
  field: F;
  filter: FilterValue;
  size: FilterSize;
  autoOpen: boolean;
  onValueChange: (value: unknown) => void;
}

function ValuePopup({
  searchPlaceholder,
  noResults,
  children,
}: {
  searchPlaceholder: string;
  noResults: string;
  children: React.ComponentProps<typeof ComboboxList>["children"];
}) {
  return (
    <ComboboxPopup className="flex min-w-52 flex-col p-0">
      <div className="border-border border-b p-2">
        <ComboboxInput
          variant="elevated"
          placeholder={searchPlaceholder}
          showTrigger={false}
          showClear={false}
        />
      </div>
      <ComboboxEmpty>{noResults}</ComboboxEmpty>
      <ComboboxList>{children}</ComboboxList>
    </ComboboxPopup>
  );
}

function SelectValueControl({
  field,
  filter,
  size,
  autoOpen,
  onValueChange,
}: ValueControlProps<SelectFilterField>) {
  const { labels } = useFilters();
  // Capture once at mount so the uncontrolled open state never changes.
  const [initialOpen] = React.useState(autoOpen);
  const selected =
    field.options.find((option) => option.value === filter.value) ?? null;

  return (
    <Combobox<FilterOption, false>
      items={field.options}
      value={selected}
      defaultOpen={initialOpen}
      onValueChange={(next) => onValueChange(next ? next.value : null)}
      itemToStringLabel={(option) => option.label}
    >
      <ComboboxTrigger
        render={(triggerProps) => (
          <Button
            {...triggerProps}
            data-slot="filter-chip-value"
            variant="ghost"
            size={size}
            className="text-foreground data-popup-open:bg-surface-hover rounded-none font-normal focus-visible:-outline-offset-2"
          >
            <span className="flex items-center gap-1.5">
              {selected?.icon}
              {selected ? (
                <span className="max-w-40 truncate">{selected.label}</span>
              ) : (
                <span className="text-muted-foreground">
                  {field.placeholder ?? labels.selectValue}
                </span>
              )}
            </span>
          </Button>
        )}
      />
      <ValuePopup
        searchPlaceholder={labels.searchValues}
        noResults={labels.noResults}
      >
        {(option: FilterOption) => (
          <ComboboxItem key={option.value} value={option}>
            <span className="flex items-center gap-2">
              {option.icon}
              <span className="truncate">{option.label}</span>
            </span>
          </ComboboxItem>
        )}
      </ValuePopup>
    </Combobox>
  );
}

function MultiSelectValueControl({
  field,
  filter,
  size,
  autoOpen,
  onValueChange,
}: ValueControlProps<MultiSelectFilterField>) {
  const { labels } = useFilters();
  // Capture once at mount so the uncontrolled open state never changes.
  const [initialOpen] = React.useState(autoOpen);
  const values = Array.isArray(filter.value) ? (filter.value as string[]) : [];
  const selected = field.options.filter((option) =>
    values.includes(option.value),
  );
  const display =
    selected.length === 0
      ? (field.placeholder ?? labels.selectValue)
      : selected.length === 1
        ? selected[0].label
        : `${selected[0].label} +${selected.length - 1}`;
  const atMax =
    field.maxSelections != null && values.length >= field.maxSelections;

  return (
    <Combobox<FilterOption, true>
      items={field.options}
      multiple
      value={selected}
      defaultOpen={initialOpen}
      onValueChange={(next) => {
        // Reject selections past the cap; controlled value snaps back.
        if (field.maxSelections != null && next.length > field.maxSelections) {
          return;
        }
        onValueChange(next.map((option) => option.value));
      }}
      itemToStringLabel={(option) => option.label}
    >
      <ComboboxTrigger
        render={(triggerProps) => (
          <Button
            {...triggerProps}
            data-slot="filter-chip-value"
            variant="ghost"
            size={size}
            className="text-foreground data-popup-open:bg-surface-hover rounded-none font-normal focus-visible:-outline-offset-2"
          >
            <span className="flex items-center gap-1.5">
              {selected.length > 0 && selected[0].icon}
              <span
                className={cn(
                  "max-w-40 truncate",
                  selected.length === 0 && "text-muted-foreground",
                )}
              >
                {display}
              </span>
            </span>
          </Button>
        )}
      />
      <ValuePopup
        searchPlaceholder={labels.searchValues}
        noResults={labels.noResults}
      >
        {(option: FilterOption) => (
          <ComboboxItem
            key={option.value}
            value={option}
            disabled={atMax && !values.includes(option.value)}
          >
            <span className="flex items-center gap-2">
              {option.icon}
              <span className="truncate">{option.label}</span>
            </span>
          </ComboboxItem>
        )}
      </ValuePopup>
    </Combobox>
  );
}

function inputSize(size: FilterSize): "sm" | "default" {
  return size === "sm" ? "sm" : "default";
}

/** Flanks an inline value input with muted prefix/suffix text (e.g. `$`, `%`). */
function withAddons(
  input: React.ReactNode,
  prefix?: React.ReactNode,
  suffix?: React.ReactNode,
): React.ReactNode {
  if (!prefix && !suffix) return input;
  return (
    <div data-slot="filter-chip-value" className="flex items-center">
      {prefix ? (
        <span className="text-muted-foreground pl-2.5 text-sm select-none">
          {prefix}
        </span>
      ) : null}
      {input}
      {suffix ? (
        <span className="text-muted-foreground pr-2.5 text-sm select-none">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

function TextValueControl({
  field,
  filter,
  size,
  autoOpen,
  onValueChange,
}: ValueControlProps<TextFilterField>) {
  return withAddons(
    <Input
      data-slot="filter-chip-value"
      type="text"
      autoFocus={autoOpen}
      value={typeof filter.value === "string" ? filter.value : ""}
      placeholder={field.placeholder ?? "Enter value"}
      size={inputSize(size)}
      className={cn(
        "w-40 flex-none rounded-none border-0 bg-transparent shadow-none focus-visible:-outline-offset-2 dark:bg-transparent",
        field.prefix && "pl-1",
        field.suffix && "pr-1",
        size === "lg" && "h-11 sm:h-10",
      )}
      onChange={(event) => onValueChange(event.target.value)}
    />,
    field.prefix,
    field.suffix,
  );
}

function fieldHeight(size: FilterSize): string {
  return size === "sm"
    ? "h-9 sm:h-8"
    : size === "lg"
      ? "h-11 sm:h-10"
      : "h-10 sm:h-9";
}

function NumberValueField({
  value,
  size,
  step,
  placeholder,
  autoFocus,
  prefix,
  suffix,
  onValueChange,
}: {
  value: number | null;
  size: FilterSize;
  step?: number;
  placeholder?: string;
  autoFocus?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onValueChange: (value: number | null) => void;
}) {
  // Base UI's NumberField.Input is a text input with numeric semantics (no
  // native spinner) and handles parsing, arrow-key stepping, and clamping.
  // `allowWheelScrub` lets the wheel adjust the value while the input is
  // focused and hovered (it won't hijack ordinary page scrolling).
  return withAddons(
    <BaseNumberField.Root
      value={value}
      step={step}
      allowWheelScrub
      onValueChange={(next) => onValueChange(next)}
      className={cn("flex flex-none items-center", fieldHeight(size))}
    >
      <BaseNumberField.Input
        data-slot="filter-chip-value"
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "h-full w-24 rounded-none border-0 bg-transparent px-2.5 text-base font-normal tabular-nums outline-none md:text-sm",
          "focus-visible:outline-ring/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid",
          prefix && "pl-1",
          suffix && "pr-1",
        )}
      />
    </BaseNumberField.Root>,
    prefix,
    suffix,
  );
}

function NumberValueControl({
  field,
  filter,
  size,
  autoOpen,
  onValueChange,
}: ValueControlProps<NumberFilterField>) {
  if (filter.operator === "between") {
    const range = isNumberRange(filter.value)
      ? filter.value
      : { min: null, max: null };
    return (
      <>
        <NumberValueField
          value={range.min}
          size={size}
          step={field.step}
          placeholder="Min"
          onValueChange={(min) => onValueChange({ ...range, min })}
        />
        <NumberValueField
          value={range.max}
          size={size}
          step={field.step}
          placeholder="Max"
          onValueChange={(max) => onValueChange({ ...range, max })}
        />
      </>
    );
  }

  return (
    <NumberValueField
      value={typeof filter.value === "number" ? filter.value : null}
      size={size}
      step={field.step}
      placeholder={field.placeholder ?? "Value"}
      prefix={field.prefix}
      suffix={field.suffix}
      autoFocus={autoOpen}
      onValueChange={onValueChange}
    />
  );
}

function FilterChipRemove() {
  const { filter } = useFilterChip();
  const { removeFilter, size } = useFilters();
  return (
    <Button
      data-slot="filter-chip-remove"
      aria-label="Remove filter"
      variant="ghost"
      size={iconButtonSize(size)}
      className="text-muted-foreground hover:text-foreground rounded-none focus-visible:-outline-offset-2"
      onClick={() => removeFilter(filter.id)}
    >
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
    </Button>
  );
}

function FilterAddButton({ children }: { children?: React.ReactNode }) {
  const {
    fields,
    usedFieldIds,
    allowDuplicateFields,
    addFilter,
    labels,
    size,
    enableShortcut,
    shortcutKey,
    shortcutLabel,
  } = useFilters();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!enableShortcut) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (
        !isTyping &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key.toLowerCase() === shortcutKey.toLowerCase()
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcut, shortcutKey]);

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
            className="text-muted-foreground gap-1.5 border-dashed"
            leftSection={<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />}
            rightSection={
              enableShortcut && shortcutLabel ? (
                <Kbd size="sm" variant="ghost" className="ms-1">
                  {shortcutLabel}
                </Kbd>
              ) : undefined
            }
          >
            {children ?? labels.add}
          </Button>
        )}
      />
      <ComboboxPopup className="flex min-w-56 flex-col p-0">
        <div className="border-border border-b p-2">
          <ComboboxInput
            variant="elevated"
            placeholder={labels.searchFields}
            showTrigger={false}
            showClear={false}
          />
        </div>
        <ComboboxEmpty>{labels.noFields}</ComboboxEmpty>
        <ComboboxList>
          {(field: FilterField) => (
            <ComboboxItem
              key={field.id}
              value={field}
              disabled={!allowDuplicateFields && usedFieldIds.has(field.id)}
            >
              <span className="flex items-center gap-2">
                {field.icon ? (
                  <span className="text-muted-foreground flex shrink-0 items-center [&_svg]:size-3.5!">
                    {field.icon}
                  </span>
                ) : null}
                <span className="truncate">{field.label}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}

function FilterClearButton() {
  const { clearAll, labels, size } = useFilters();
  return (
    <Button
      data-slot="filter-clear"
      variant="ghost"
      size={size}
      className="text-muted-foreground gap-1.5"
      onClick={clearAll}
      leftSection={<HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />}
    >
      {labels.clear}
    </Button>
  );
}

function FilterActiveCount() {
  const { filters } = useFilters();
  return (
    <Badge data-slot="filter-active-count" variant="neutral">
      {filters.length}
    </Badge>
  );
}

export {
  Filters,
  FilterChip,
  FilterChipField,
  FilterChipOperator,
  FilterChipValue,
  FilterChipRemove,
  FilterAddButton,
  FilterClearButton,
  FilterActiveCount,
};
export { useFilters, useFilterChip } from "./filters-context";
export {
  createFilter,
  resolveOperators,
  defaultOperatorsFor,
  isValuelessOperator,
  emptyValueFor,
} from "./lib/filters-utils";
export type {
  FilterField,
  FilterFieldType,
  FilterOption,
  FilterOperator,
  FilterValue,
  FilterSize,
  FiltersLabels,
  FiltersProps,
  FilterChipProps,
  FilterValueControlProps,
  NumberRange,
  SelectFilterField,
  MultiSelectFilterField,
  TextFilterField,
  NumberFilterField,
  CustomFilterField,
} from "./lib/filters-types";
