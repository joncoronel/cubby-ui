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

import { OptionContent, SearchIcon, STEP_ROW } from "./filters-add-menu";
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
  FilterValueControlProps,
  MultiSelectFilterField,
  NumberFilterField,
  SelectFilterField,
  TextFilterField,
} from "./lib/filters-types";

interface ValueControlProps<F extends FilterField> {
  field: F;
  filter: FilterValue;
  onValueChange: (value: unknown) => void;
  className?: string;
}

/** A chip's value control for its field type; renders nothing for valueless operators (`is empty`). */
function FilterChipValue({
  className,
}: {
  /** Merged into the value segment (both segments of a `between` range). */
  className?: string;
}) {
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
          className={className}
        />
      );
    case "text":
      return (
        <TextValueControl
          field={field}
          filter={filter}
          onValueChange={onValueChange}
          className={className}
        />
      );
    case "number":
      return (
        <NumberValueControl
          field={field}
          filter={filter}
          onValueChange={onValueChange}
          className={className}
        />
      );
    case "custom":
      return (
        <div
          data-slot="filter-chip-value"
          className={cn("flex h-full items-stretch", className)}
        >
          <CustomValue
            value={filter.value}
            operator={filter.operator}
            onValueChange={onValueChange}
            size={size}
            field={field}
          />
        </div>
      );
    default:
      return null;
  }
}

// Its own component so `renderValue` can use hooks: called inline they'd belong
// to the chip and break once a valueless operator stopped calling it.
function CustomValue(props: FilterValueControlProps) {
  return props.field.renderValue(props);
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

/** Up to three overlapping option icons, ringed in the chip fill to separate them. */
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
        start={<SearchIcon />}
        className={STEP_ROW}
      />
      <ComboboxEmpty>{empty}</ComboboxEmpty>
      <ComboboxList className="max-h-72 py-1">{children}</ComboboxList>
    </ComboboxPopup>
  );
}

function OptionsValueControl({
  field,
  filter,
  onValueChange,
  className,
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
    // Render function so the segment's classes replace the stock trigger's
    // rather than merging.
    <ComboboxTrigger
      render={(triggerProps) => (
        <button
          {...triggerProps}
          type="button"
          data-slot="filter-chip-value"
          // Leads with the visible text so voice control can target it.
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
            className,
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

const INPUT_SEGMENT = cn(
  FILTER_SEGMENT,
  "hover:bg-surface-hover focus-visible:bg-surface-hover cursor-text bg-transparent font-medium",
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground placeholder:font-normal",
  "field-sizing-content max-w-48 min-w-[1ch] not-supports-[field-sizing:content]:w-28",
  // 16px on small screens, below which iOS zooms in on a focused input.
  "max-md:text-base",
);

function ValueSegment({
  prefix,
  suffix,
  className,
  children,
}: {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="filter-chip-value"
      className={cn(
        "flex h-full items-center",
        prefix != null && "[&_input]:ps-1",
        suffix != null && "[&_input]:pe-1",
        className,
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
  className,
}: ValueControlProps<TextFilterField>) {
  const { labels } = useFiltersActions();
  return (
    <ValueSegment
      prefix={field.prefix}
      suffix={field.suffix}
      className={className}
    >
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
  className,
  step,
  placeholder,
  prefix,
  suffix,
  "aria-label": ariaLabel,
  onValueChange,
}: {
  value: number | null;
  className?: string;
  step?: number;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  "aria-label": string;
  onValueChange: (value: number | null) => void;
}) {
  // `allowWheelScrub` only acts while focused and hovered, so page scroll is safe.
  return (
    <ValueSegment prefix={prefix} suffix={suffix} className={className}>
      <BaseNumberField.Root
        value={value}
        step={step}
        allowWheelScrub
        onValueChange={onValueChange}
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
  className,
}: ValueControlProps<NumberFilterField>) {
  const { labels } = useFiltersActions();

  if (operatorShapeFor(field, filter.operator) === "range") {
    const range = asNumberRange(filter.value);
    return (
      <>
        <NumberValueField
          className={className}
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
          className={className}
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
      className={className}
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

export { FilterChipValue };
