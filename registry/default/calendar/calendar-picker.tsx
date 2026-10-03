"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

/* -------------------------------------------------------------------------------------------------
 * Shared cell styles, used by the calendar's days and the picker's cells
 * -------------------------------------------------------------------------------------------------*/

export const focusRing =
  "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * A background in `::before`, painted from `--cell-paint`, that shrinks on
 * press while the label holds still, as Button's does.
 */
export const pressPaint =
  "before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:bg-(--cell-paint,transparent) before:transition-[scale] before:duration-100 before:ease-out active:before:scale-[0.96]";

export const cellButtonClassName = cn(
  // Layout
  "relative z-1 flex size-full items-center justify-center rounded-lg text-sm tabular-nums",
  // Focus
  focusRing,
  "focus-visible:z-2",
  // Interaction: colours change instantly, since a fade would trail the
  // pointer across the days.
  "cursor-pointer transition-[outline-color,outline-offset] duration-150 ease-out",
  pressPaint,
  "hover:[--cell-paint:var(--surface-hover)]",
  // Today: a dot under the number, re-coloured when the day is filled
  "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-1 after:mx-auto after:size-1 after:rounded-full after:bg-primary after:opacity-0",
);

/* -------------------------------------------------------------------------------------------------
 * Keyboard
 * -------------------------------------------------------------------------------------------------*/

/**
 * Arrow-key movement across a grid of buttons. Columns are counted from layout
 * with disabled cells included, so rows stay true when some are out of bounds.
 */
function moveInGrid(event: React.KeyboardEvent<HTMLElement>): void {
  const cells = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
  );
  const index = cells.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return;

  const top = cells[0].offsetTop;
  const columns = Math.max(
    1,
    cells.filter((cell) => cell.offsetTop === top).length,
  );
  const step =
    getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
  const strides: Record<string, number> = {
    ArrowLeft: -step,
    ArrowRight: step,
    ArrowUp: -columns,
    ArrowDown: columns,
  };

  let target: number | undefined;
  if (event.key === "Home") {
    target = cells.findIndex((cell) => !cell.disabled);
  } else if (event.key === "End") {
    target = cells.findLastIndex((cell) => !cell.disabled);
  } else if (event.key in strides) {
    const stride = strides[event.key];
    for (
      let next = index + stride;
      next >= 0 && next < cells.length;
      next += stride
    ) {
      if (!cells[next].disabled) {
        target = next;
        break;
      }
    }
  } else {
    return;
  }

  event.preventDefault();
  if (target !== undefined && target >= 0) cells[target].focus();
}

/* -------------------------------------------------------------------------------------------------
 * Month and year picker
 * -------------------------------------------------------------------------------------------------*/

interface CalendarPickerProps {
  id: string;
  open: boolean;
  year: number;
  onYearChange: (year: number) => void;
  minYear: number;
  maxYear: number;
  /** The displayed month the picker was opened from. */
  activeMonth: Date;
  today: Date;
  locale: string | undefined;
  isMonthDisabled: (year: number, month: number) => boolean;
  onSelectMonth: (month: number) => void;
  onClose: () => void;
  label: string;
  yearsLabel: string;
}

/**
 * A scrolling year column beside the year's twelve months. Picking a year only
 * changes which months show; picking a month goes there and closes.
 */
function CalendarPicker({
  id,
  open,
  year,
  onYearChange,
  minYear,
  maxYear,
  activeMonth,
  today,
  locale,
  isMonthDisabled,
  onSelectMonth,
  onClose,
  label,
  yearsLabel,
}: CalendarPickerProps) {
  const yearsRef = React.useRef<HTMLDivElement>(null);
  const focusYearRef = React.useRef(false);
  const monthsRef = React.useRef<HTMLDivElement>(null);
  // The month focused when PageUp/PageDown changed the year, to refocus after.
  const focusMonthRef = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    if (!open) return;
    const list = yearsRef.current;
    const active = list?.querySelector<HTMLElement>("[data-active]");
    if (!list || !active) return;
    list.scrollTop =
      active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
  }, [open]);

  // Keyboard moves in the year column select as they go, so focus follows.
  React.useEffect(() => {
    if (!focusYearRef.current) return;
    focusYearRef.current = false;
    const active =
      yearsRef.current?.querySelector<HTMLElement>("[data-active]");
    active?.focus();
    active?.scrollIntoView({ block: "nearest" });
  }, [year]);

  // Keep focus on the same month in the new year, or on the first one that
  // isn't out of bounds there.
  React.useEffect(() => {
    const index = focusMonthRef.current;
    if (index === null) return;
    focusMonthRef.current = null;
    const cells =
      monthsRef.current?.querySelectorAll<HTMLButtonElement>("button");
    if (!cells) return;
    const target = cells[index]?.disabled
      ? Array.from(cells).find((cell) => !cell.disabled)
      : cells[index];
    target?.focus();
  }, [year]);

  const stepYear = (next: number) => {
    const clamped = Math.min(Math.max(next, minYear), maxYear);
    if (clamped === year) return;
    focusYearRef.current = true;
    onYearChange(clamped);
  };

  const monthFormat = new Intl.DateTimeFormat(locale, { month: "short" });
  const monthLongFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, index) => minYear + index,
  );
  const months = Array.from({ length: 12 }, (_, monthOfYear) => monthOfYear);
  const activeInYear = activeMonth.getFullYear() === year;
  const tabStop =
    activeInYear && !isMonthDisabled(year, activeMonth.getMonth())
      ? activeMonth.getMonth()
      : months.find((monthOfYear) => !isMonthDisabled(year, monthOfYear));

  return (
    <div
      id={id}
      role="group"
      aria-label={label}
      data-slot="calendar-picker"
      data-state={open ? "open" : "closed"}
      inert={!open}
      className={cn(
        "absolute inset-x-0 top-(--calendar-header) bottom-0 z-3 flex overflow-hidden",
        "rounded-xl bg-(--calendar-surface)",
      )}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
    >
      <ScrollArea
        fadeEdges="y"
        hideScrollbar
        viewportRef={(element) => {
          yearsRef.current = element;
        }}
        className="border-border/60 h-auto w-17 shrink-0 border-e"
      >
        <div
          role="group"
          aria-label={yearsLabel}
          data-slot="calendar-picker-years"
          className="flex flex-col gap-0.5 p-1"
          onKeyDown={(event) => {
            const moves: Record<string, number> = {
              ArrowUp: year - 1,
              ArrowDown: year + 1,
              PageUp: year - 10,
              PageDown: year + 10,
              Home: minYear,
              End: maxYear,
            };
            if (!(event.key in moves)) return;
            event.preventDefault();
            stepYear(moves[event.key]);
          }}
        >
          {years.map((option) => {
            const active = option === year;
            return (
              <button
                key={option}
                type="button"
                data-active={active || undefined}
                data-today={option === today.getFullYear() || undefined}
                aria-current={active || undefined}
                tabIndex={active ? 0 : -1}
                onClick={() => onYearChange(option)}
                className={cn(
                  cellButtonClassName,
                  "text-muted-foreground h-8 w-full shrink-0",
                  "data-today:after:opacity-100",
                  "data-active:text-foreground data-active:font-semibold data-active:[--cell-paint:var(--surface-hover)]",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <div
        role="group"
        aria-label={String(year)}
        ref={monthsRef}
        data-slot="calendar-picker-months"
        className="grid flex-1 auto-rows-fr grid-cols-3 gap-x-1 p-1"
        onKeyDown={(event) => {
          if (event.key === "PageUp" || event.key === "PageDown") {
            event.preventDefault();
            const next = Math.min(
              Math.max(year + (event.key === "PageUp" ? -1 : 1), minYear),
              maxYear,
            );
            if (next === year) return;
            focusMonthRef.current = Array.from(
              event.currentTarget.querySelectorAll("button"),
            ).indexOf(document.activeElement as HTMLButtonElement);
            onYearChange(next);
            return;
          }
          moveInGrid(event);
        }}
      >
        {months.map((monthOfYear) => {
          const date = new Date(year, monthOfYear, 1);
          const active = activeInYear && monthOfYear === activeMonth.getMonth();
          const isCurrent =
            year === today.getFullYear() && monthOfYear === today.getMonth();
          return (
            <button
              key={monthOfYear}
              type="button"
              data-active={active || undefined}
              data-today={isCurrent || undefined}
              aria-label={monthLongFormat.format(date)}
              aria-current={active || undefined}
              tabIndex={monthOfYear === tabStop ? 0 : -1}
              disabled={isMonthDisabled(year, monthOfYear)}
              onClick={() => onSelectMonth(monthOfYear)}
              className={cn(
                cellButtonClassName,
                "h-9 w-full self-center font-medium sm:h-8",
                "data-today:after:opacity-100",
                "data-active:text-primary-foreground data-active:after:bg-primary-foreground data-active:[--cell-paint:var(--primary)] data-active:hover:[--cell-paint:var(--primary-hover)]",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              {monthFormat.format(date)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { CalendarPicker };
