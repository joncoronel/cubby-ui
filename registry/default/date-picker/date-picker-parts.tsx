"use client";

import * as React from "react";
import type { Matcher } from "react-day-picker";
import type { VariantProps } from "class-variance-authority";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { CalendarPresets } from "@/registry/default/calendar/calendar";
import { inputVariants } from "@/registry/default/input/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";
import { startOfDay } from "@/registry/default/lib/date-utils";
import {
  PopoverContent,
  PopoverTrigger,
} from "@/registry/default/popover/popover";

/*
 * The pieces DatePicker and DateRangePicker share: the trigger, the clear
 * button, the popover around the calendar, and the editable field.
 */

/**
 * Props that reach the picker's control, whichever element it is: the
 * trigger button, or the text input when `editable`. Kept to what both
 * accept (id, aria-*, data-*, handlers).
 */
export type PickerControlProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "defaultValue" | "onChange" | "onSelect" | "children"
>;

/** min, max, and extra blocked dates as one list of DayPicker matchers. */
export function toDisabledMatchers(
  minDate: Date | undefined,
  maxDate: Date | undefined,
  disabledDates: Matcher | Matcher[] | undefined,
): Matcher[] {
  return [
    ...(minDate ? [{ before: startOfDay(minDate) }] : []),
    ...(maxDate ? [{ after: startOfDay(maxDate) }] : []),
    ...(disabledDates
      ? Array.isArray(disabledDates)
        ? disabledDates
        : [disabledDates]
      : []),
  ];
}

/* -------------------------------------------------------------------------------------------------
 * Trigger and clear button
 * -------------------------------------------------------------------------------------------------*/

type DatePickerTriggerProps = PickerControlProps &
  VariantProps<typeof inputVariants> & {
    ref?: React.Ref<HTMLButtonElement>;
    disabled?: boolean;
    /** Nothing selected: the label is the placeholder. */
    empty: boolean;
    /** Leaves room for the clear button over the trigger's end. */
    showClear: boolean;
    children: React.ReactNode;
  };

function DatePickerTrigger({
  variant,
  size,
  empty,
  showClear,
  children,
  ...props
}: DatePickerTriggerProps) {
  return (
    <PopoverTrigger
      data-placeholder={empty || undefined}
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
      <span className="min-w-0 flex-1 truncate tabular-nums">{children}</span>
    </PopoverTrigger>
  );
}

function DatePickerClear({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      data-slot="date-picker-clear"
      aria-label={label}
      onClick={onClear}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-surface-hover absolute end-1.5 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md",
        // A 44px hit area without growing the button.
        "before:absolute before:-inset-2.5",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-1",
        "transition-[outline-color,outline-offset] duration-150 ease-out",
      )}
    >
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
    </button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Popover content
 * -------------------------------------------------------------------------------------------------*/

function DatePickerContent({
  anchor,
  presets,
  presetsLabel,
  children,
}: {
  /** Positions against this instead of the trigger (the editable field). */
  anchor?: React.RefObject<HTMLElement | null>;
  /** Preset buttons for the rail; nothing renders when empty. */
  presets?: React.ReactNode[];
  presetsLabel: string;
  children: React.ReactNode;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  return (
    <PopoverContent
      align="start"
      // The popover is the calendar's surface (its own frame is turned off);
      // 16px corners over 4px padding keep the header strip concentric.
      className="rounded-2xl"
      // The calendar goes from two months to one (or back) as the window
      // narrows or widens while open.
      followContentWidth
      viewportClassName="p-1 [--viewport-padding:0.25rem]"
      anchor={anchor}
      // Land on the selected day (or today), not the month arrows.
      initialFocus={() =>
        panelRef.current?.querySelector<HTMLElement>(
          '[data-slot="calendar-day"] button[tabindex="0"]',
        ) ?? true
      }
    >
      <div ref={panelRef} className="flex flex-col gap-1 sm:flex-row">
        {presets && presets.length > 0 && (
          <CalendarPresets
            aria-label={presetsLabel}
            className="border-border/60 border-b px-1 pt-1 pb-1.5 sm:w-32 sm:border-e sm:border-b-0 sm:p-1 sm:pe-2"
          >
            {presets}
          </CalendarPresets>
        )}
        {children}
      </div>
    </PopoverContent>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Editable field
 *
 * Used when `editable` is set: a text input that reads what's typed, with the
 * calendar trigger beside it. While editing, a hint on the right shows how
 * the text will be read, so "next fri" is confirmed as a date before it's
 * committed (on Enter or blur).
 * -------------------------------------------------------------------------------------------------*/

export interface DateFieldReading<T> {
  value: T;
  /** How the text was understood, shown while typing. */
  hint: string;
  /** Set when the text is a date that isn't allowed. */
  error?: string;
}

type DatePickerFieldProps<T> = PickerControlProps &
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
    /** Shown when committing text that can't be read. */
    invalidLabel: string;
    showClear: boolean;
    placeholder?: string;
    disabled?: boolean;
  };

function DatePickerField<T>({
  groupRef,
  text,
  read,
  onCommit,
  onOpenRequest,
  triggerLabel,
  clearLabel,
  invalidLabel,
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
  // A commit was refused (Enter or blur); the draft stays, marked invalid.
  const [rejected, setRejected] = React.useState(false);
  // A new value from elsewhere (the calendar, a preset, the parent) replaces
  // any leftover draft, refused or not.
  const [shownText, setShownText] = React.useState(text);
  if (shownText !== text) {
    setShownText(text);
    setDraft(null);
    setRejected(false);
  }
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = React.useId();

  const editing = draft !== null && draft.trim() !== "" && draft !== text;
  const reading = editing ? read(draft) : null;

  let hint = "";
  if (editing && reading) hint = reading.error ?? reading.hint;
  else if (editing && rejected) hint = invalidLabel;
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

  /** Commits, or keeps the text and marks it invalid when it can't. */
  const settle = () => {
    if (commit()) {
      setDraft(null);
      setRejected(false);
    } else {
      setRejected(true);
    }
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
          // Keep refused text to fix; otherwise start from the value.
          if (draft === null) setDraft(text);
          event.currentTarget.select();
          onFocus?.(event);
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          setRejected(false);
        }}
        onBlur={(event) => {
          settle();
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Enter") {
            event.preventDefault();
            settle();
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
      {/* Announces a refused commit only. The visible hint below changes on
          nearly every keystroke, so it's linked by aria-describedby instead
          of being a live region. */}
      <span aria-live="polite" className="sr-only">
        {rejected && editing ? hint : ""}
      </span>
      {(hint || showClear) && (
        <InputGroupAddon
          align="inline-end"
          className="max-w-[60%] min-w-0 gap-1.5"
        >
          <span
            id={hintId}
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
                // Focusing starts an edit from the old text; the cleared value
                // replaces that draft when it renders.
                inputRef.current?.focus();
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

export {
  DatePickerClear,
  DatePickerContent,
  DatePickerField,
  DatePickerTrigger,
};
