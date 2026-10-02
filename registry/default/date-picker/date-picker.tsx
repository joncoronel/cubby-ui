"use client";

import * as React from "react";
import {
  dateMatchModifiers,
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
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";
import { inputVariants } from "@/registry/default/input/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";
import { parseDate } from "@/registry/default/lib/parse-date";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";

export interface DatePickerPreset {
  label: string;
  /** A date, or a function so relative presets ("Tomorrow") stay current. */
  value: Date | (() => Date);
}

export type DatePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "onSelect" | "children"
> &
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
    /** Passed through to the calendar (locale, week start, and so on). */
    calendarProps?: Partial<PropsBase>;
  };

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

function resolvePreset(preset: DatePickerPreset): Date {
  return typeof preset.value === "function" ? preset.value() : preset.value;
}

/* -------------------------------------------------------------------------------------------------
 * Editable field
 *
 * Shared by DatePicker and DateRangePicker when `editable` is set: a text
 * input that reads what's typed, with the calendar trigger beside it. While
 * editing, a hint on the right shows how the text will be read, so "next fri"
 * is confirmed as a date before it's committed (on Enter or blur).
 * -------------------------------------------------------------------------------------------------*/

export interface DateFieldReading<T> {
  value: T;
  /** How the text was understood, shown while typing. */
  hint: string;
  /** Set when the text is a date that isn't allowed. */
  error?: string;
}

export type DatePickerFieldProps<T> = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size"
> &
  VariantProps<typeof inputVariants> & {
    groupRef: React.Ref<HTMLDivElement>;
    /** The committed value, written out. Empty when there is none. */
    text: string;
    read: (text: string) => DateFieldReading<T> | null;
    onCommit: (value: T | null) => void;
    /** Opens the calendar (ArrowDown in the input). */
    onOpenRequest: () => void;
    triggerLabel: string;
    clearLabel: string;
    showClear: boolean;
  };

function DatePickerField<T>({
  groupRef,
  text,
  read,
  onCommit,
  onOpenRequest,
  triggerLabel,
  clearLabel,
  showClear,
  variant,
  size,
  disabled,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: DatePickerFieldProps<T>) {
  // `null` while not editing, so the input shows the committed value.
  const [draft, setDraft] = React.useState<string | null>(null);
  const [rejected, setRejected] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = React.useId();

  const editing = draft !== null && draft.trim() !== "" && draft !== text;
  const reading = editing ? read(draft) : null;

  let hint = "";
  if (editing && reading) hint = reading.error ?? reading.hint;
  else if (editing && rejected) hint = "Not a date";
  const invalid = editing && (reading?.error !== undefined || rejected);

  /** Applies the draft. False when it can't be read or isn't allowed. */
  const commit = (): boolean => {
    if (draft === null || draft === text) return true;
    if (draft.trim() === "") {
      onCommit(null);
      return true;
    }
    if (!reading || reading.error) return false;
    onCommit(reading.value);
    return true;
  };

  return (
    <InputGroup
      ref={groupRef}
      variant={variant}
      data-slot="date-picker-field"
      className={className}
    >
      <InputGroupAddon align="inline-start">
        <PopoverTrigger
          disabled={disabled}
          aria-label={triggerLabel}
          render={<InputGroupButton size="icon_xs" />}
        >
          <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
        </PopoverTrigger>
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        size={size}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? hintId : undefined}
        className="min-w-0 tabular-nums"
        {...props}
        value={draft ?? text}
        onFocus={(event) => {
          setDraft(text);
          event.currentTarget.select();
          onFocus?.(event);
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          setRejected(false);
        }}
        onBlur={(event) => {
          commit();
          setDraft(null);
          setRejected(false);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Enter") {
            event.preventDefault();
            if (commit()) setDraft(null);
            else setRejected(true);
          } else if (event.key === "Escape" && editing) {
            // Revert the edit; a second Escape is left to the page.
            event.preventDefault();
            event.stopPropagation();
            setDraft(text);
            setRejected(false);
            requestAnimationFrame(() => inputRef.current?.select());
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            onOpenRequest();
          }
        }}
      />
      {(hint || showClear) && (
        <InputGroupAddon
          align="inline-end"
          className="max-w-[60%] min-w-0 gap-1.5"
        >
          <span
            id={hintId}
            aria-live="polite"
            className={cn(
              "min-w-0 truncate text-xs font-normal whitespace-nowrap tabular-nums",
              invalid && "text-danger-foreground",
            )}
          >
            {hint}
          </span>
          {showClear && !editing && (
            <InputGroupButton
              size="icon_xs"
              aria-label={clearLabel}
              onClick={() => {
                onCommit(null);
                inputRef.current?.focus();
                // Focusing starts an edit from the old text (the cleared
                // value hasn't rendered yet); start it empty instead, or
                // leaving the field would commit the old date back.
                setDraft("");
              }}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      )}
    </InputGroup>
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
  minDate,
  maxDate,
  disabledDates,
  presets,
  name,
  calendarProps,
  variant,
  size,
  className,
  disabled,
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
  const panelRef = React.useRef<HTMLDivElement>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);

  const locale = calendarProps?.locale?.code;
  const label = value
    ? (format?.(value) ??
      new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(value))
    : null;

  const disabledMatchers: Matcher[] = [
    ...(minDate ? [{ before: startOfDay(minDate) }] : []),
    ...(maxDate ? [{ after: startOfDay(maxDate) }] : []),
    ...(disabledDates
      ? Array.isArray(disabledDates)
        ? disabledDates
        : [disabledDates]
      : []),
  ];

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
    const blocked =
      disabledMatchers.length > 0 && dateMatchModifiers(date, disabledMatchers);
    return {
      value: date,
      hint: hintFormat(date),
      error: blocked ? "Unavailable" : undefined,
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
            triggerLabel="Choose date"
            clearLabel="Clear date"
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
              {label ?? placeholder}
            </span>
          </PopoverTrigger>
        )}
        <PopoverContent
          align="start"
          // The popover is the calendar's surface (its own frame is turned
          // off below); 16px corners over 4px padding keep the header strip
          // concentric with it.
          className="w-auto rounded-2xl"
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
              <CalendarPresets className="border-border/60 border-b px-1 pt-1 pb-1.5 sm:w-32 sm:border-e sm:border-b-0 sm:p-1 sm:pe-2">
                {presets.map((preset) => {
                  const date = resolvePreset(preset);
                  const presetDisabled = Boolean(
                    (minDate && date < startOfDay(minDate)) ||
                    (maxDate && startOfDay(date) > startOfDay(maxDate)),
                  );
                  return (
                    <CalendarPreset
                      key={preset.label}
                      active={value !== null && isSameDay(value, date)}
                      disabled={presetDisabled}
                      onClick={() => commit(startOfDay(date))}
                    >
                      {preset.label}
                    </CalendarPreset>
                  );
                })}
              </CalendarPresets>
            )}
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
          </div>
        </PopoverContent>
      </Popover>

      {showClear && !editable && (
        <button
          type="button"
          data-slot="date-picker-clear"
          aria-label="Clear date"
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

export { DatePicker, DatePickerField };
