"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
} from "@/registry/default/combobox/combobox";
import { Input } from "@/registry/default/input/input";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";

import { useFilterChip, useFiltersActions } from "./filters-context";
import { asNumberOrNull, asNumberRange, asString, asStringArray, FILTER_SIZES } from "./lib/filters-utils";
import type {
  FilterField,
  FilterOption,
  FilterSize,
  FilterValue,
  MultiSelectFilterField,
  NumberFilterField,
  SelectFilterField,
  TextFilterField,
} from "./lib/filters-types";

interface ValueControlProps<F extends FilterField> {
  field: F;
  filter: FilterValue;
  size: FilterSize;
  autoOpen: boolean;
  onValueChange: (value: unknown) => void;
}

/** The value segment of a pill. Renders the control matching the field type. */
function FilterChipValue() {
  const { field, filter, size, autoOpen } = useFilterChip();
  const { updateFilter } = useFiltersActions();
  const onValueChange = React.useCallback(
    (nextValue: unknown) => updateFilter(filter.id, { value: nextValue }),
    [updateFilter, filter.id],
  );

  switch (field.type) {
    case "select":
    case "multiselect":
      return (
        <OptionsValueControl
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

/** Accessible name for a value input, folding in string affixes ("$", "hrs"). */
function valueAriaLabel(
  field: TextFilterField | NumberFilterField,
  part: string,
): string {
  const affixes = [field.prefix, field.suffix].filter(
    (affix): affix is string => typeof affix === "string",
  );
  return [`${field.label} ${part}`, ...affixes].join(" ");
}

// ----- Select / multiselect ----------------------------------------------

const VALUE_TRIGGER_CLASSES =
  "text-foreground data-popup-open:bg-surface-hover rounded-none font-normal focus-visible:-outline-offset-2";

function OptionContent({ option }: { option: FilterOption }) {
  return (
    <span className="flex items-center gap-2">
      {option.icon}
      <span className="truncate">{option.label}</span>
    </span>
  );
}

interface OptionsTriggerProps {
  size: FilterSize;
  icon?: React.ReactNode;
  text: string;
  isPlaceholder: boolean;
}

/** Shared ghost trigger for the single- and multi-select value popups. */
function OptionsTrigger({ size, icon, text, isPlaceholder }: OptionsTriggerProps) {
  return (
    <ComboboxTrigger
      render={(triggerProps) => (
        <Button
          {...triggerProps}
          data-slot="filter-chip-value"
          variant="ghost"
          size={size}
          className={VALUE_TRIGGER_CLASSES}
        >
          <span className="flex items-center gap-1.5">
            {icon}
            <span
              className={cn(
                "max-w-40 truncate",
                isPlaceholder && "text-muted-foreground",
              )}
            >
              {text}
            </span>
          </span>
        </Button>
      )}
    />
  );
}

/**
 * The searchable popup shell shared by the value pickers and the add-filter
 * menu: bordered search header, empty state, and the option list.
 */
function FilterSearchPopup({
  placeholder,
  empty,
  className,
  children,
}: {
  placeholder: string;
  empty: React.ReactNode;
  className?: string;
  children: React.ComponentProps<typeof ComboboxList>["children"];
}) {
  return (
    <ComboboxPopup className={cn("flex min-w-52 flex-col p-0", className)}>
      <div className="border-border border-b p-2">
        <ComboboxInput
          variant="elevated"
          placeholder={placeholder}
          showTrigger={false}
          showClear={false}
        />
      </div>
      <ComboboxEmpty>{empty}</ComboboxEmpty>
      <ComboboxList>{children}</ComboboxList>
    </ComboboxPopup>
  );
}

function OptionsPopup({
  children,
}: {
  children: React.ComponentProps<typeof ComboboxList>["children"];
}) {
  const { labels } = useFiltersActions();
  return (
    <FilterSearchPopup
      placeholder={labels.searchValues}
      empty={labels.noResults}
    >
      {children}
    </FilterSearchPopup>
  );
}

/** Value control for `select` and `multiselect` fields. */
function OptionsValueControl({
  field,
  filter,
  size,
  autoOpen,
  onValueChange,
}: ValueControlProps<SelectFilterField | MultiSelectFilterField>) {
  const { labels } = useFiltersActions();
  // Capture once at mount so the uncontrolled open state never changes.
  const [initialOpen] = React.useState(autoOpen);
  const placeholder = field.placeholder ?? labels.selectValue;

  if (field.type === "multiselect") {
    const values = asStringArray(filter.value);
    const selected = field.options.filter((option) =>
      values.includes(option.value),
    );
    const atMax =
      field.maxSelections != null && values.length >= field.maxSelections;
    const display =
      selected.length === 0
        ? placeholder
        : selected.length === 1
          ? selected[0].label
          : `${selected[0].label} +${selected.length - 1}`;

    return (
      <Combobox<FilterOption, true>
        items={field.options}
        multiple
        value={selected}
        defaultOpen={initialOpen}
        onValueChange={(next) => {
          // Reject selections past the cap; the controlled value snaps back.
          if (field.maxSelections != null && next.length > field.maxSelections) {
            return;
          }
          onValueChange(next.map((option) => option.value));
        }}
        itemToStringLabel={(option) => option.label}
      >
        <OptionsTrigger
          size={size}
          icon={selected[0]?.icon}
          text={display}
          isPlaceholder={selected.length === 0}
        />
        <OptionsPopup>
          {(option: FilterOption) => (
            <ComboboxItem
              key={option.value}
              value={option}
              disabled={atMax && !values.includes(option.value)}
            >
              <OptionContent option={option} />
            </ComboboxItem>
          )}
        </OptionsPopup>
      </Combobox>
    );
  }

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
      <OptionsTrigger
        size={size}
        icon={selected?.icon}
        text={selected?.label ?? placeholder}
        isPlaceholder={!selected}
      />
      <OptionsPopup>
        {(option: FilterOption) => (
          <ComboboxItem key={option.value} value={option}>
            <OptionContent option={option} />
          </ComboboxItem>
        )}
      </OptionsPopup>
    </Combobox>
  );
}

// ----- Text / number ------------------------------------------------------

/**
 * The value segment wrapper for inline inputs. Owns the `filter-chip-value`
 * slot and flanks the input with muted prefix/suffix text (e.g. `$`, `%`).
 */
function ValueSegment({
  prefix,
  suffix,
  children,
}: {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="filter-chip-value"
      className={cn(
        "flex items-center",
        prefix && "[&_input]:pl-1",
        suffix && "[&_input]:pr-1",
      )}
    >
      {prefix ? (
        <span className="text-muted-foreground pl-2.5 text-sm select-none">
          {prefix}
        </span>
      ) : null}
      {children}
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
  const { labels } = useFiltersActions();
  return (
    <ValueSegment prefix={field.prefix} suffix={field.suffix}>
      <Input
        data-slot="filter-chip-value-input"
        type="text"
        autoFocus={autoOpen}
        aria-label={valueAriaLabel(field, labels.value.toLowerCase())}
        value={asString(filter.value)}
        placeholder={field.placeholder ?? labels.enterValue}
        size={FILTER_SIZES[size].input}
        className={cn(
          "w-40 flex-none rounded-none border-0 bg-transparent shadow-none focus-visible:-outline-offset-2 dark:bg-transparent",
          FILTER_SIZES[size].height,
        )}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </ValueSegment>
  );
}

function NumberValueField({
  value,
  size,
  step,
  placeholder,
  autoFocus,
  prefix,
  suffix,
  "aria-label": ariaLabel,
  onValueChange,
}: {
  value: number | null;
  size: FilterSize;
  step?: number;
  placeholder?: string;
  autoFocus?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  "aria-label": string;
  onValueChange: (value: number | null) => void;
}) {
  // Base UI's NumberField.Input is a text input with numeric semantics (no
  // native spinner) and handles parsing, arrow-key stepping, and clamping.
  // `allowWheelScrub` lets the wheel adjust the value while the input is
  // focused and hovered (it won't hijack ordinary page scrolling).
  return (
    <ValueSegment prefix={prefix} suffix={suffix}>
      <BaseNumberField.Root
        value={value}
        step={step}
        allowWheelScrub
        onValueChange={(next) => onValueChange(next)}
        className={cn("flex flex-none items-center", FILTER_SIZES[size].height)}
      >
        <BaseNumberField.Input
          data-slot="filter-chip-value-input"
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={cn(
            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
            "h-full w-24 rounded-none border-0 bg-transparent px-2.5 text-base font-normal tabular-nums outline-none md:text-sm",
            "focus-visible:outline-ring/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid",
          )}
        />
      </BaseNumberField.Root>
    </ValueSegment>
  );
}

function NumberValueControl({
  field,
  filter,
  size,
  autoOpen,
  onValueChange,
}: ValueControlProps<NumberFilterField>) {
  const { labels } = useFiltersActions();

  if (filter.operator === "between") {
    const range = asNumberRange(filter.value);
    return (
      <>
        <NumberValueField
          value={range.min}
          size={size}
          step={field.step}
          placeholder={labels.min}
          prefix={field.prefix}
          suffix={field.suffix}
          aria-label={valueAriaLabel(field, labels.min.toLowerCase())}
          autoFocus={autoOpen}
          onValueChange={(min) => onValueChange({ ...range, min })}
        />
        <NumberValueField
          value={range.max}
          size={size}
          step={field.step}
          placeholder={labels.max}
          prefix={field.prefix}
          suffix={field.suffix}
          aria-label={valueAriaLabel(field, labels.max.toLowerCase())}
          onValueChange={(max) => onValueChange({ ...range, max })}
        />
      </>
    );
  }

  return (
    <NumberValueField
      value={asNumberOrNull(filter.value)}
      size={size}
      step={field.step}
      placeholder={field.placeholder ?? labels.value}
      prefix={field.prefix}
      suffix={field.suffix}
      aria-label={valueAriaLabel(field, labels.value.toLowerCase())}
      autoFocus={autoOpen}
      onValueChange={onValueChange}
    />
  );
}

export { FilterChipValue, FilterSearchPopup };
