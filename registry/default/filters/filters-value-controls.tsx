"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
} from "@/registry/default/combobox/combobox";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { OptionContent } from "./filters-add-menu";
import { useFilterChip, useFiltersActions } from "./filters-context";
import {
  asNumberOrNull,
  asNumberRange,
  asString,
  asStringArray,
  CLICK_MORPH_MS,
  FILTER_SEGMENT,
  FILTER_SEGMENT_INTERACTIVE,
  operatorShapeFor,
} from "./lib/filters-utils";
import type {
  FilterField,
  FilterOption,
  FilterValue,
  MultiSelectFilterField,
  NumberFilterField,
  SelectFilterField,
  TextFilterField,
} from "./lib/filters-types";

interface ValueControlProps<F extends FilterField> {
  field: F;
  filter: FilterValue;
  onValueChange: (value: unknown) => void;
}

/**
 * The value segment of a chip. Renders the control matching the field type,
 * or nothing when the operator's shape is `"none"` (`is empty`), so custom
 * chip compositions are correct without re-implementing that rule.
 */
function FilterChipValue() {
  const { field, filter, size } = useFilterChip();
  const { updateFilter } = useFiltersActions();
  const onValueChange = React.useCallback(
    (nextValue: unknown) => updateFilter(filter.id, { value: nextValue }),
    [updateFilter, filter.id],
  );

  if (operatorShapeFor(field, filter.operator) === "none") return null;

  switch (field.type) {
    case "select":
    case "multiselect":
      return (
        <OptionsValueControl
          field={field}
          filter={filter}
          onValueChange={onValueChange}
        />
      );
    case "text":
      return (
        <TextValueControl
          field={field}
          filter={filter}
          onValueChange={onValueChange}
        />
      );
    case "number":
      return (
        <NumberValueControl
          field={field}
          filter={filter}
          onValueChange={onValueChange}
        />
      );
    case "custom":
      return (
        <div
          data-slot="filter-chip-value"
          className="flex h-full items-stretch"
        >
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

/**
 * Up to three option icons, overlapped like a hand of cards and ringed in the
 * chip's own fill so each reads against the one beneath. Icons join and
 * leave with a small scale so a pick registers on the chip itself.
 */
function StackedIcons({ options }: { options: FilterOption[] }) {
  const withIcons = options.filter((option) => option.icon).slice(0, 3);
  if (withIcons.length === 0) return null;
  return (
    <span aria-hidden className="flex shrink-0 items-center">
      {withIcons.map((option, index) => (
        <span
          key={option.value}
          style={{ zIndex: withIcons.length - index }}
          className={cn(
            "bg-card ring-card relative flex items-center justify-center rounded-full ring-[1.5px]",
            index > 0 && "-ms-0.5",
            "transition-[scale,opacity] duration-150 ease-out motion-reduce:transition-none starting:scale-50 starting:opacity-0",
          )}
        >
          {option.icon}
        </span>
      ))}
    </span>
  );
}

/**
 * The searchable popup shell for editing a chip's options: the same ruled
 * search row as the add menu, then the list.
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
    <ComboboxPopup
      align="start"
      className={cn("flex w-64 flex-col p-0", className)}
    >
      <ComboboxInput
        showTrigger={false}
        showClear={false}
        placeholder={placeholder}
        start={
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="text-muted-foreground size-4"
          />
        }
        className="h-11 gap-2 rounded-none border-0 border-b bg-transparent px-3 outline-0 focus-within:outline-0 focus-within:outline-offset-0 sm:h-11 dark:bg-transparent"
      />
      <ComboboxEmpty>{empty}</ComboboxEmpty>
      <ComboboxList className="max-h-72 py-1">{children}</ComboboxList>
    </ComboboxPopup>
  );
}

/** Value control for `select` and `multiselect` fields. */
function OptionsValueControl({
  field,
  filter,
  onValueChange,
}: ValueControlProps<SelectFilterField | MultiSelectFilterField>) {
  const { labels } = useFiltersActions();
  const placeholder = field.placeholder ?? labels.selectValue;
  const multiple = field.type === "multiselect";

  const values = multiple
    ? asStringArray(filter.value)
    : typeof filter.value === "string"
      ? [filter.value]
      : [];
  const selected = field.options.filter((option) =>
    values.includes(option.value),
  );
  const atMax =
    multiple &&
    field.maxSelections != null &&
    values.length >= field.maxSelections;
  const text =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0].label
        : labels.selectedCount(selected.length, field);

  const trigger = (
    // Render function, so the segment's classes replace the stock trigger's
    // rather than merging with them.
    <ComboboxTrigger
      render={(triggerProps) => (
        <button
          {...triggerProps}
          type="button"
          data-slot="filter-chip-value"
          // Starts with what it shows ("2 selected"), so voice control can
          // name it, then says which.
          aria-label={`${field.label} ${labels.value.toLowerCase()}: ${
            selected.length > 1
              ? `${text} (${selected.map((option) => option.label).join(", ")})`
              : text
          }`}
          className={cn(
            FILTER_SEGMENT,
            FILTER_SEGMENT_INTERACTIVE,
            "font-medium",
            selected.length === 0 && "text-muted-foreground font-normal",
          )}
        >
          <StackedIcons options={selected} />
          <TextMorph
            value={text}
            split="word"
            duration={CLICK_MORPH_MS}
            className="max-w-48 overflow-hidden"
          />
        </button>
      )}
    />
  );

  const popup = (
    <FilterSearchPopup
      placeholder={labels.searchValues}
      empty={labels.noResults}
    >
      {(option: FilterOption) => (
        <ComboboxItem
          key={option.value}
          value={option}
          disabled={atMax && !values.includes(option.value)}
          className="my-0!"
        >
          <OptionContent option={option} />
        </ComboboxItem>
      )}
    </FilterSearchPopup>
  );

  if (multiple) {
    return (
      <Combobox<FilterOption, true>
        items={field.options}
        multiple
        autoHighlight
        value={selected}
        onValueChange={(next) => {
          // Reject selections past the cap; the controlled value snaps back.
          if (
            field.maxSelections != null &&
            next.length > field.maxSelections
          ) {
            return;
          }
          onValueChange(next.map((option) => option.value));
        }}
        itemToStringLabel={(option) => option.label}
      >
        {trigger}
        {popup}
      </Combobox>
    );
  }

  return (
    <Combobox<FilterOption, false>
      items={field.options}
      autoHighlight
      value={selected[0] ?? null}
      onValueChange={(next) => onValueChange(next ? next.value : null)}
      itemToStringLabel={(option) => option.label}
    >
      {trigger}
      {popup}
    </Combobox>
  );
}

// ----- Text / number ------------------------------------------------------

// Inputs are segments too: no chrome of their own, the chip's hover plate on
// hover, and a width that follows what's typed (`field-sizing`, with a fixed
// width where it's unsupported).
const INPUT_SEGMENT = cn(
  FILTER_SEGMENT,
  "hover:bg-surface-hover focus-visible:bg-surface-hover cursor-text bg-transparent font-medium",
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground placeholder:font-normal",
  "field-sizing-content max-w-48 min-w-[1ch] not-supports-[field-sizing:content]:w-28",
  // 16px on small screens, below which iOS zooms in on a focused input.
  "max-md:text-base",
);

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
        "flex h-full items-center",
        prefix != null && "[&_input]:ps-1",
        suffix != null && "[&_input]:pe-1",
      )}
    >
      {prefix != null && (
        <span className="text-muted-foreground ps-(--seg-x) select-none">
          {prefix}
        </span>
      )}
      {children}
      {suffix != null && (
        <span className="text-muted-foreground pe-(--seg-x) select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function TextValueControl({
  field,
  filter,
  onValueChange,
}: ValueControlProps<TextFilterField>) {
  const { labels } = useFiltersActions();
  return (
    <ValueSegment prefix={field.prefix} suffix={field.suffix}>
      <input
        data-slot="filter-chip-value-input"
        type="text"
        aria-label={valueAriaLabel(field, labels.value.toLowerCase())}
        value={asString(filter.value)}
        placeholder={field.placeholder ?? labels.enterValue}
        className={INPUT_SEGMENT}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </ValueSegment>
  );
}

function NumberValueField({
  value,
  step,
  placeholder,
  prefix,
  suffix,
  "aria-label": ariaLabel,
  onValueChange,
}: {
  value: number | null;
  step?: number;
  placeholder?: string;
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
        className="flex h-full items-center"
      >
        <BaseNumberField.Input
          data-slot="filter-chip-value-input"
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={cn(
            INPUT_SEGMENT,
            "tabular-nums not-supports-[field-sizing:content]:w-16",
          )}
        />
      </BaseNumberField.Root>
    </ValueSegment>
  );
}

function NumberValueControl({
  field,
  filter,
  onValueChange,
}: ValueControlProps<NumberFilterField>) {
  const { labels } = useFiltersActions();

  if (operatorShapeFor(field, filter.operator) === "range") {
    const range = asNumberRange(filter.value);
    return (
      <>
        <NumberValueField
          value={range.min}
          step={field.step}
          placeholder={labels.min}
          prefix={field.prefix}
          suffix={field.suffix}
          aria-label={valueAriaLabel(field, labels.min.toLowerCase())}
          onValueChange={(min) => onValueChange({ ...range, min })}
        />
        <span
          aria-hidden
          className="text-muted-foreground shrink-0 px-0.5 select-none"
        >
          {labels.and}
        </span>
        <NumberValueField
          value={range.max}
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
      step={field.step}
      placeholder={field.placeholder ?? labels.value}
      prefix={field.prefix}
      suffix={field.suffix}
      aria-label={valueAriaLabel(field, labels.value.toLowerCase())}
      onValueChange={onValueChange}
    />
  );
}

export { FilterChipValue, FilterSearchPopup };
