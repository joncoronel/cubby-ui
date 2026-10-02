"use client";

import * as React from "react";
import {
  rangeContainsModifiers,
  type DateRange,
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
import {
  DatePickerClear,
  DatePickerContent,
  DatePickerField,
  DatePickerTrigger,
  toDisabledMatchers,
  type DateFieldReading,
  type PickerControlProps,
} from "@/registry/default/date-picker/date-picker-parts";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";
import type { inputVariants } from "@/registry/default/input/input";
import {
  daysBetween,
  isSameDay,
  startOfDay,
  toISODate,
} from "@/registry/default/lib/date-utils";
import { parseDateRange } from "@/registry/default/lib/parse-date";
import { Popover } from "@/registry/default/popover/popover";

export type { DateRange };

/** A complete range: both ends set. */
export interface DateRangeValue {
  from: Date;
  to: Date;
}

export interface DateRangePreset {
  label: string;
  /** A range, or a function so relative presets ("Last 7 days") stay current. */
  value: DateRangeValue | (() => DateRangeValue);
}

/** Copy overrides for the picker's own text, for wording and translation. */
export interface DateRangePickerLabels {
  /** The calendar button beside an `editable` field. */
  chooseDates: string;
  clear: string;
  /** The group of presets, for screen readers. */
  presets: string;
  /** Status line before anything is picked. */
  pickStart: string;
  /** Status line once the start is picked; `start` is already formatted. */
  pickEnd: (start: string) => string;
  /**
   * A range's length, after the dates in the status line and the typing
   * hint. Counts both ends; return nights (`days - 1`) for stays.
   */
  duration: (days: number) => string;
  /** Typed text that can't be read as a range (`editable`). */
  invalid: string;
  /** A typed range that crosses a blocked date or the min/max bounds. */
  unavailable: string;
  /** A typed range shorter than `minNights`. */
  tooShort: (minNights: number) => string;
  /** A typed range longer than `maxNights`. */
  tooLong: (maxNights: number) => string;
}

const DEFAULT_LABELS: DateRangePickerLabels = {
  chooseDates: "Choose dates",
  clear: "Clear date range",
  presets: "Presets",
  pickStart: "Pick a start date",
  pickEnd: (start) => `${start} – pick an end date`,
  duration: (days) => `${days} ${days === 1 ? "day" : "days"}`,
  invalid: "Not a date range",
  unavailable: "Unavailable",
  tooShort: (nights) =>
    `At least ${nights} ${nights === 1 ? "night" : "nights"}`,
  tooLong: (nights) => `At most ${nights} ${nights === 1 ? "night" : "nights"}`,
};

export type DateRangePickerProps = PickerControlProps &
  VariantProps<typeof inputVariants> & {
    /** The selected range. `null` means nothing is selected. */
    value?: DateRangeValue | null;
    defaultValue?: DateRangeValue | null;
    /** Fires once both ends are picked, or with `null` when cleared. */
    onValueChange?: (value: DateRangeValue | null) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placeholder?: string;
    /** Formats the range on the trigger. Defaults to a compact locale range. */
    format?: (range: DateRangeValue) => string;
    /** Shows a button that clears the range. */
    clearable?: boolean;
    /**
     * Makes the field a text input: type "mar 3 – 12", "today to fri" or
     * "last 30 days", and the calendar opens from the button beside it.
     */
    editable?: boolean;
    disabled?: boolean;
    /** Earliest selectable date. Also stops navigation before its month. */
    minDate?: Date;
    /** Latest selectable date. Also stops navigation after its month. */
    maxDate?: Date;
    /** Extra dates to block, as DayPicker matchers. */
    disabledDates?: Matcher | Matcher[];
    /** Shortest allowed range, in nights (DayPicker's `min`). */
    minNights?: number;
    /** Longest allowed range, in nights (DayPicker's `max`). */
    maxNights?: number;
    /** Months shown side by side. Defaults to 2, or 1 on small screens. */
    numberOfMonths?: number;
    /** One-click ranges shown beside the calendar. */
    presets?: DateRangePreset[];
    /** Submits the ends as `YYYY-MM-DD` under `${name}From` and `${name}To`. */
    name?: string;
    /**
     * Passed through to the calendar (locale, week start, and so on). Its
     * `labels` take DayPicker's and the calendar's own screen-reader text.
     */
    calendarProps?: Omit<Partial<PropsBase>, "labels"> & {
      labels?: CalendarLabelsProp;
    };
    /** Copy overrides for the picker's own text, merged over the defaults. */
    labels?: Partial<DateRangePickerLabels>;
  };

/** Days in a range, counting both ends. */
function countDays(range: DateRangeValue): number {
  return daysBetween(range.from, range.to) + 1;
}

function resolvePreset(preset: DateRangePreset): DateRangeValue {
  const range =
    typeof preset.value === "function" ? preset.value() : preset.value;
  return { from: startOfDay(range.from), to: startOfDay(range.to) };
}

/**
 * A range written out with one formatter: a single day on its own, or the
 * locale's compact range. ICU versions disagree on thin vs regular spaces
 * around the dash, which breaks hydration between Node and the browser, so
 * those are normalised.
 */
function formatSpan(
  formatter: Intl.DateTimeFormat,
  range: DateRangeValue,
): string {
  return isSameDay(range.from, range.to)
    ? formatter.format(range.from)
    : formatter
        .formatRange(range.from, range.to)
        .replace(/[\u2009\u202f]/g, " ");
}

function useMediaQuery(query: string): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function DateRangePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = "Pick a date range",
  format,
  clearable = false,
  editable = false,
  disabled,
  minDate,
  maxDate,
  disabledDates,
  minNights,
  maxNights,
  numberOfMonths,
  presets,
  name,
  calendarProps,
  labels,
  variant,
  size,
  className,
  ...props
}: DateRangePickerProps) {
  const [value, setValue] = useControllableState<DateRangeValue | null>({
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
  const wide = useMediaQuery("(min-width: 640px)");

  // The range being picked. It only reaches `value` once both ends are set,
  // so closing halfway leaves the committed range untouched.
  const [draft, setDraft] = React.useState<DateRange | undefined>(
    value ?? undefined,
  );
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value ?? undefined);
  }

  const copy = { ...DEFAULT_LABELS, ...labels };
  const locale = calendarProps?.locale?.code;
  const dayFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formatRange = (range: DateRangeValue) =>
    format?.(range) ?? formatSpan(dayFormat, range);

  // The typing hint drops the year when the whole range is in this year.
  const formatHint = (range: DateRangeValue) => {
    const thisYear = new Date().getFullYear();
    return range.from.getFullYear() === thisYear &&
      range.to.getFullYear() === thisYear
      ? formatSpan(
          new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }),
          range,
        )
      : formatRange(range);
  };

  const disabledMatchers = toDisabledMatchers(minDate, maxDate, disabledDates);

  /** Why a range can't be picked, or undefined when it can. */
  const rangeError = (range: DateRangeValue): string | undefined => {
    const nights = countDays(range) - 1;
    if (
      disabledMatchers.length > 0 &&
      rangeContainsModifiers(range, disabledMatchers)
    ) {
      return copy.unavailable;
    }
    if (minNights !== undefined && nights < minNights) {
      return copy.tooShort(minNights);
    }
    if (maxNights !== undefined && nights > maxNights) {
      return copy.tooLong(maxNights);
    }
    return undefined;
  };

  const commit = (range: DateRangeValue | null) => {
    setValue(range);
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range.to) {
      commit({ from: range.from, to: range.to });
      return;
    }
    setDraft(range);
  };

  const status = (() => {
    if (!draft?.from) return copy.pickStart;
    if (!draft.to) return copy.pickEnd(dayFormat.format(draft.from));
    const range = { from: draft.from, to: draft.to };
    return `${formatRange(range)} · ${copy.duration(countDays(range))}`;
  })();

  const readText = (text: string): DateFieldReading<DateRangeValue> | null => {
    const range = parseDateRange(text, { locale });
    if (!range) return null;
    return {
      value: range,
      hint: `${formatHint(range)} · ${copy.duration(countDays(range))}`,
      error: rangeError(range),
    };
  };

  const showClear = clearable && value !== null && !disabled;

  return (
    <div
      data-slot="date-range-picker"
      className={cn("relative inline-flex w-72 max-w-full", className)}
    >
      <Popover open={open} onOpenChange={(next) => setOpen(next)}>
        {editable ? (
          <DatePickerField
            groupRef={groupRef}
            text={value ? formatRange(value) : ""}
            read={readText}
            onCommit={setValue}
            onOpenRequest={() => setOpen(true)}
            triggerLabel={copy.chooseDates}
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
            {value ? formatRange(value) : placeholder}
          </DatePickerTrigger>
        )}
        <DatePickerContent
          anchor={editable ? groupRef : undefined}
          presetsLabel={copy.presets}
          presets={presets?.map((preset) => {
            const range = resolvePreset(preset);
            return (
              <CalendarPreset
                key={preset.label}
                active={Boolean(
                  draft?.from &&
                  draft.to &&
                  isSameDay(draft.from, range.from) &&
                  isSameDay(draft.to, range.to),
                )}
                disabled={rangeError(range) !== undefined}
                onClick={() => commit(range)}
              >
                {preset.label}
              </CalendarPreset>
            );
          })}
        >
          <div className="flex flex-col">
            <Calendar
              {...calendarProps}
              framed={false}
              mode="range"
              numberOfMonths={numberOfMonths ?? (wide ? 2 : 1)}
              selected={draft}
              onSelect={handleSelect}
              min={minNights}
              max={maxNights}
              excludeDisabled={disabledDates !== undefined}
              disabled={
                disabledMatchers.length > 0 ? disabledMatchers : undefined
              }
              startMonth={calendarProps?.startMonth ?? minDate}
              endMonth={calendarProps?.endMonth ?? maxDate}
            />
            <div className="flex min-h-9 items-center px-2 pt-1">
              {/* Wraps rather than truncates: a cross-year range or a longer
                  locale can run past one month's width. */}
              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "text-sm text-pretty tabular-nums",
                  draft?.to ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {status}
              </p>
            </div>
          </div>
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
        <>
          <input
            type="hidden"
            name={`${name}From`}
            value={value ? toISODate(value.from) : ""}
            disabled={disabled}
          />
          <input
            type="hidden"
            name={`${name}To`}
            value={value ? toISODate(value.to) : ""}
            disabled={disabled}
          />
        </>
      )}
    </div>
  );
}

export { DateRangePicker };
