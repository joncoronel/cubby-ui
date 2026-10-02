"use client";

import * as React from "react";
import {
  dateMatchModifiers,
  type Matcher,
  type PropsBase,
} from "react-day-picker";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarPreset,
  type CalendarLabelsProp,
} from "@/registry/default/calendar/calendar";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";
import type { inputVariants } from "@/registry/default/input/input";
import {
  isSameDay,
  startOfDay,
  toISODate,
} from "@/registry/default/lib/date-utils";
import { parseDate } from "@/registry/default/lib/parse-date";
import { Popover } from "@/registry/default/popover/popover";

import {
  DatePickerClear,
  DatePickerContent,
  DatePickerField,
  DatePickerTrigger,
  toDisabledMatchers,
  type DateFieldReading,
  type PickerControlProps,
} from "./date-picker-parts";

export interface DatePickerPreset {
  label: string;
  /** A date, or a function so relative presets ("Tomorrow") stay current. */
  value: Date | (() => Date);
}

/** Copy overrides for the picker's own text, for wording and translation. */
export interface DatePickerLabels {
  /** The calendar button beside an `editable` field. */
  chooseDate: string;
  clear: string;
  /** The group of presets, for screen readers. */
  presets: string;
  /** Typed text that can't be read as a date (`editable`). */
  invalid: string;
  /** A typed date that's blocked by min, max, or `disabledDates`. */
  unavailable: string;
}

const DEFAULT_LABELS: DatePickerLabels = {
  chooseDate: "Choose date",
  clear: "Clear date",
  presets: "Presets",
  invalid: "Not a date",
  unavailable: "Unavailable",
};

export type DatePickerProps = PickerControlProps &
  VariantProps<typeof inputVariants> & {
    /** The selected date. `null` means nothing is selected. */
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    /** Formats the date on the trigger. Defaults to the locale's medium date. */
    format?: (date: Date) => string;
    /** Shows a button that clears the date. */
    clearable?: boolean;
    /**
     * Makes the field a text input: type "tomorrow", "next fri", "mar 14" or
     * "3/14", and the calendar opens from the button beside it.
     */
    editable?: boolean;
    disabled?: boolean;
    /** Earliest selectable date. Also stops navigation before its month. */
    minDate?: Date;
    /** Latest selectable date. Also stops navigation after its month. */
    maxDate?: Date;
    /** Extra dates to block, as DayPicker matchers. */
    disabledDates?: Matcher | Matcher[];
    /** One-click shortcuts shown beside the calendar. */
    presets?: DatePickerPreset[];
    /** Submits the date as `YYYY-MM-DD` under this name in a form. */
    name?: string;
    /**
     * Passed through to the calendar (locale, week start, and so on). Its
     * `labels` take DayPicker's and the calendar's own screen-reader text.
     */
    calendarProps?: Omit<Partial<PropsBase>, "labels"> & {
      labels?: CalendarLabelsProp;
    };
    /** Copy overrides for the picker's own text, merged over the defaults. */
    labels?: Partial<DatePickerLabels>;
  };

function resolvePreset(preset: DatePickerPreset): Date {
  return startOfDay(
    typeof preset.value === "function" ? preset.value() : preset.value,
  );
}

function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Pick a date",
  format,
  clearable = false,
  editable = false,
  disabled,
  minDate,
  maxDate,
  disabledDates,
  presets,
  name,
  calendarProps,
  labels,
  variant,
  size,
  className,
  ...props
}: DatePickerProps) {
  const [value, setValue] = useControllableState<Date | null>({
    value: valueProp,
    defaultValue,
    onValueChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);

  const copy = { ...DEFAULT_LABELS, ...labels };
  const locale = calendarProps?.locale?.code;
  const label = value
    ? (format?.(value) ??
      new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(value))
    : null;

  const disabledMatchers = toDisabledMatchers(minDate, maxDate, disabledDates);
  const isBlocked = (date: Date) =>
    disabledMatchers.length > 0 && dateMatchModifiers(date, disabledMatchers);

  const commit = (date: Date | null) => {
    setValue(date);
    setOpen(false);
  };

  // The hint names the weekday and drops the year when it's this year.
  const hintFormat = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    }).format(date);
  const readText = (text: string): DateFieldReading<Date> | null => {
    const date = parseDate(text, { locale });
    if (!date) return null;
    return {
      value: date,
      hint: hintFormat(date),
      error: isBlocked(date) ? copy.unavailable : undefined,
    };
  };

  const showClear = clearable && value !== null && !disabled;

  return (
    <div
      data-slot="date-picker"
      className={cn("relative inline-flex w-60 max-w-full", className)}
    >
      <Popover open={open} onOpenChange={(next) => setOpen(next)}>
        {editable ? (
          <DatePickerField
            groupRef={groupRef}
            text={label ?? ""}
            read={readText}
            onCommit={setValue}
            onOpenRequest={() => setOpen(true)}
            triggerLabel={copy.chooseDate}
            clearLabel={copy.clear}
            invalidLabel={copy.invalid}
            showClear={showClear}
            placeholder={placeholder}
            disabled={disabled}
            variant={variant}
            size={size}
            {...props}
          />
        ) : (
          <DatePickerTrigger
            ref={triggerRef}
            disabled={disabled}
            empty={value === null}
            showClear={showClear}
            variant={variant}
            size={size}
            {...props}
          >
            {label ?? placeholder}
          </DatePickerTrigger>
        )}
        <DatePickerContent
          anchor={editable ? groupRef : undefined}
          presetsLabel={copy.presets}
          presets={presets?.map((preset) => {
            const date = resolvePreset(preset);
            return (
              <CalendarPreset
                key={preset.label}
                active={value !== null && isSameDay(value, date)}
                disabled={isBlocked(date)}
                onClick={() => commit(date)}
              >
                {preset.label}
              </CalendarPreset>
            );
          })}
        >
          <Calendar
            {...calendarProps}
            framed={false}
            mode="single"
            required
            selected={value ?? undefined}
            onSelect={(date) => commit(date)}
            disabled={
              disabledMatchers.length > 0 ? disabledMatchers : undefined
            }
            startMonth={calendarProps?.startMonth ?? minDate}
            endMonth={calendarProps?.endMonth ?? maxDate}
          />
        </DatePickerContent>
      </Popover>

      {showClear && !editable && (
        <DatePickerClear
          label={copy.clear}
          onClear={() => {
            setValue(null);
            triggerRef.current?.focus();
          }}
        />
      )}

      {name && (
        <input
          type="hidden"
          name={name}
          value={value ? toISODate(value) : ""}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export { DatePicker };
