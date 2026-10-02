"use client";

import * as React from "react";
import {
  rangeContainsModifiers,
  type DateRange,
  type Matcher,
  type PropsBase,
} from "react-day-picker";
import type { VariantProps } from "class-variance-authority";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarPreset,
  CalendarPresets,
} from "@/registry/default/calendar/calendar";
import {
  DatePickerField,
  type DateFieldReading,
} from "@/registry/default/date-picker/date-picker";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";
import { inputVariants } from "@/registry/default/input/input";
import { parseDateRange } from "@/registry/default/lib/parse-date";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";

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

export type DateRangePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "onSelect" | "children"
> &
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
    /** Passed through to the calendar (locale, week start, and so on). */
    calendarProps?: Partial<PropsBase>;
  };

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Days in a range, counting both ends. Rounded to absorb DST shifts. */
function countDays(range: DateRangeValue): number {
  return (
    Math.round(
      (startOfDay(range.to).getTime() - startOfDay(range.from).getTime()) /
        DAY_MS,
    ) + 1
  );
}

function resolvePreset(preset: DateRangePreset): DateRangeValue {
  const range =
    typeof preset.value === "function" ? preset.value() : preset.value;
  return { from: startOfDay(range.from), to: startOfDay(range.to) };
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
  minDate,
  maxDate,
  disabledDates,
  minNights,
  maxNights,
  numberOfMonths,
  presets,
  name,
  calendarProps,
  variant,
  size,
  className,
  disabled,
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
  const panelRef = React.useRef<HTMLDivElement>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);
  const closeTimeoutRef = React.useRef<number | undefined>(undefined);
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

  const locale = calendarProps?.locale?.code;
  const dayFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formatRange = (range: DateRangeValue) =>
    format?.(range) ??
    (isSameDay(range.from, range.to)
      ? dayFormat.format(range.from)
      : // ICU versions disagree on thin vs regular spaces around the dash,
        // which breaks hydration between Node and the browser.
        dayFormat.formatRange(range.from, range.to).replace(/[  ]/g, " "));

  const disabledMatchers: Matcher[] = [
    ...(minDate ? [{ before: startOfDay(minDate) }] : []),
    ...(maxDate ? [{ after: startOfDay(maxDate) }] : []),
    ...(disabledDates
      ? Array.isArray(disabledDates)
        ? disabledDates
        : [disabledDates]
      : []),
  ];

  const commit = (range: DateRangeValue | null) => {
    setValue(range);
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setDraft(range);
    if (!range?.from || !range.to) return;
    setValue({ from: range.from, to: range.to });
    // Close a beat later so the range is seen landing (the calendar's band
    // sweep), unless motion is reduced and there's nothing to see.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(false);
    } else {
      closeTimeoutRef.current = window.setTimeout(() => setOpen(false), 350);
    }
  };

  React.useEffect(() => () => window.clearTimeout(closeTimeoutRef.current), []);

  const status = (() => {
    if (!draft?.from) return "Pick a start date";
    if (!draft.to) {
      return `${dayFormat.format(draft.from)} – pick an end date`;
    }
    const range = { from: draft.from, to: draft.to };
    const days = countDays(range);
    return `${formatRange(range)} · ${days} ${days === 1 ? "day" : "days"}`;
  })();

  const showClear = clearable && value !== null && !disabled;

  // The hint drops the year when the whole range is in this year.
  const formatHint = (range: DateRangeValue) => {
    const thisYear = new Date().getFullYear();
    if (
      range.from.getFullYear() !== thisYear ||
      range.to.getFullYear() !== thisYear
    ) {
      return formatRange(range);
    }
    const short = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    });
    return isSameDay(range.from, range.to)
      ? short.format(range.from)
      : short.formatRange(range.from, range.to).replace(/[\u2009\u202f]/g, " ");
  };

  const readText = (text: string): DateFieldReading<DateRangeValue> | null => {
    const range = parseDateRange(text, { locale });
    if (!range) return null;
    const days = countDays(range);
    const nights = days - 1;
    let error: string | undefined;
    if (
      disabledMatchers.length > 0 &&
      rangeContainsModifiers(range, disabledMatchers)
    ) {
      error = "Unavailable";
    } else if (minNights !== undefined && nights < minNights) {
      error = `At least ${minNights} ${minNights === 1 ? "night" : "nights"}`;
    } else if (maxNights !== undefined && nights > maxNights) {
      error = `At most ${maxNights} ${maxNights === 1 ? "night" : "nights"}`;
    }
    return {
      value: range,
      hint: `${formatHint(range)} · ${days} ${days === 1 ? "day" : "days"}`,
      error,
    };
  };

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
            triggerLabel="Choose dates"
            clearLabel="Clear date range"
            showClear={showClear}
            placeholder={placeholder}
            disabled={disabled}
            variant={variant}
            size={size}
            {...(props as Omit<React.ComponentProps<"input">, "size">)}
          />
        ) : (
          <PopoverTrigger
            ref={triggerRef}
            disabled={disabled}
            data-placeholder={value === null || undefined}
            className={cn(
              inputVariants({ variant, size }),
              "cursor-pointer items-center gap-2 text-start",
              variant === "elevated"
                ? "hover:bg-surface-hover data-popup-open:bg-surface-hover"
                : "hover:bg-(--outline-hover) data-popup-open:bg-(--outline-hover)",
              "data-placeholder:text-muted-foreground",
              showClear && "pe-9",
            )}
            {...props}
          >
            <HugeiconsIcon
              icon={Calendar01Icon}
              strokeWidth={2}
              className="text-muted-foreground size-4 shrink-0"
            />
            <span className="min-w-0 flex-1 truncate tabular-nums">
              {value ? formatRange(value) : placeholder}
            </span>
          </PopoverTrigger>
        )}
        <PopoverContent
          align="start"
          // The popover is the calendar's tray: muted, with the days card
          // inside it (the calendar's own tray is turned off below).
          className="bg-muted w-auto rounded-2xl"
          viewportClassName="p-1 [--viewport-padding:0.25rem]"
          anchor={editable ? groupRef : undefined}
          // Land on the selected day (or today), not the month arrows.
          initialFocus={() =>
            panelRef.current?.querySelector<HTMLElement>(
              '[data-slot="calendar-day"] button[tabindex="0"]',
            ) ?? true
          }
        >
          <div ref={panelRef} className="flex flex-col gap-1 sm:flex-row">
            {presets && presets.length > 0 && (
              <CalendarPresets className="px-1 pt-1 sm:w-32 sm:p-1">
                {presets.map((preset) => {
                  const range = resolvePreset(preset);
                  const presetDisabled = Boolean(
                    (minDate && range.from < startOfDay(minDate)) ||
                    (maxDate && range.to > startOfDay(maxDate)),
                  );
                  return (
                    <CalendarPreset
                      key={preset.label}
                      active={Boolean(
                        draft?.from &&
                        draft.to &&
                        isSameDay(draft.from, range.from) &&
                        isSameDay(draft.to, range.to),
                      )}
                      disabled={presetDisabled}
                      onClick={() => commit(range)}
                    >
                      {preset.label}
                    </CalendarPreset>
                  );
                })}
              </CalendarPresets>
            )}
            <div className="flex flex-col">
              <Calendar
                {...calendarProps}
                tray={false}
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
                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "truncate text-sm tabular-nums",
                    draft?.to ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {status}
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {showClear && !editable && (
        <button
          type="button"
          data-slot="date-range-picker-clear"
          aria-label="Clear date range"
          onClick={() => {
            setValue(null);
            triggerRef.current?.focus();
          }}
          className={cn(
            "text-muted-foreground hover:text-foreground hover:bg-surface-hover absolute end-1.5 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md",
            // Grow the hit area without growing the button.
            "before:absolute before:-inset-1.5",
            "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-1",
            "transition-[background-color,color,outline-color,outline-offset] duration-150 ease-out",
          )}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            className="size-3.5"
          />
        </button>
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
