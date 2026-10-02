"use client";

import * as React from "react";
import {
  DayPicker,
  useDayPicker,
  type DateRange,
  type DayEventHandler,
  type DayPickerProps,
  type DayProps,
  type Matcher,
  type MonthCaptionProps,
} from "react-day-picker";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/default/button/button";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";

import "./calendar.css";

export type CalendarProps = DayPickerProps;

type CalendarView = "days" | "months" | "years";

type LayerState = "active" | "inner" | "outer";

interface CalendarContextValue {
  /** True when the caption opens the month and year grids. */
  drilldown: boolean;
  view: CalendarView;
  openMonths: (displayIndex: number) => void;
}

const CalendarContext = React.createContext<CalendarContextValue | null>(null);

const YEARS_PER_PAGE = 12;

/* -------------------------------------------------------------------------------------------------
 * Date helpers
 * -------------------------------------------------------------------------------------------------*/

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/** Months since year 0, so two months compare with plain arithmetic. */
function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function firstSelectedDate(props: DayPickerProps): Date | undefined {
  const { selected } = props as { selected?: Date | Date[] | DateRange };
  if (!selected) return undefined;
  if (selected instanceof Date) return selected;
  if (Array.isArray(selected)) return selected[0];
  return selected.from;
}

/* -------------------------------------------------------------------------------------------------
 * Classes
 * -------------------------------------------------------------------------------------------------*/

const navButtonClassName = cn(
  buttonVariants({ variant: "ghost", size: "icon_sm" }),
  "text-muted-foreground hover:text-foreground rtl:[&_svg]:-scale-x-100",
  "aria-disabled:pointer-events-none aria-disabled:opacity-40",
);

const cellButtonClassName = cn(
  // Layout
  "relative z-1 flex size-full items-center justify-center rounded-lg text-sm tabular-nums",
  // Focus
  "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:z-2 focus-visible:outline-2 focus-visible:outline-offset-2",
  // Interaction
  "cursor-pointer transition-[background-color,color,box-shadow,scale,outline-color,outline-offset] duration-150 ease-out active:scale-[0.96] motion-reduce:active:scale-100",
  "hover:bg-surface-hover",
  // Today: a dot under the number, re-coloured when the day is filled
  "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-1 after:mx-auto after:size-1 after:rounded-full after:bg-primary after:opacity-0",
);

const DEFAULT_CLASS_NAMES: NonNullable<DayPickerProps["classNames"]> = {
  root: "relative w-fit",
  months: "relative flex flex-col gap-x-6 gap-y-4 sm:flex-row",
  month: "flex flex-col",
  month_caption: "mb-2 flex h-8 items-center pe-18",
  caption_label: "text-sm font-medium",
  dropdowns: "flex items-center gap-2 text-sm font-medium",
  dropdown_root: "relative inline-flex items-center",
  dropdown: "absolute inset-0 cursor-pointer opacity-0",
  nav: "absolute end-0 top-0 z-2 flex h-8 items-center gap-0.5",
  month_grid: "border-separate border-spacing-x-0 border-spacing-y-0.5",
  weekdays: "",
  weekday:
    "text-muted-foreground size-10 p-0 pb-1 text-xs font-medium sm:size-9",
  week_number_header: "size-10 p-0 pb-1 sm:size-9",
  week_number:
    "text-muted-foreground/70 size-10 p-0 text-xs tabular-nums sm:size-9",
  weeks: "",
  week: "",
  day: cn(
    "group/day relative size-10 p-0 text-center sm:size-9",
    "data-disabled:pointer-events-none",
  ),
  day_button: cn(
    cellButtonClassName,
    // Outside the displayed month
    "group-data-muted/day:text-muted-foreground",
    // Today
    "group-data-today/day:font-semibold group-data-today/day:after:opacity-100",
    // Selected (and the two ends of a range)
    "group-data-filled/day:bg-primary group-data-filled/day:text-primary-foreground group-data-filled/day:hover:bg-primary-hover group-data-filled/day:font-medium group-data-filled/day:after:bg-primary-foreground",
    // Disabled: struck through so it doesn't rely on colour alone
    "group-data-disabled/day:text-muted-foreground group-data-disabled/day:decoration-muted-foreground/60 group-data-disabled/day:line-through group-data-disabled/day:opacity-60",
  ),
  footer: "text-muted-foreground mt-3 text-sm",
  hidden: "invisible",
  // Month transitions, see calendar.css
  weeks_before_enter: "calendar-enter-from-start",
  weeks_before_exit: "calendar-exit-to-start",
  weeks_after_enter: "calendar-enter-from-end",
  weeks_after_exit: "calendar-exit-to-end",
  caption_before_enter: "calendar-caption-enter-from-start",
  caption_before_exit: "calendar-caption-exit-to-start",
  caption_after_enter: "calendar-caption-enter-from-end",
  caption_after_exit: "calendar-caption-exit-to-end",
};

function mergeClassNames(
  overrides: DayPickerProps["classNames"],
): NonNullable<DayPickerProps["classNames"]> {
  if (!overrides) return DEFAULT_CLASS_NAMES;
  const merged: Record<string, string> = { ...DEFAULT_CLASS_NAMES };
  for (const [key, value] of Object.entries(overrides)) {
    merged[key] = cn(merged[key], value);
  }
  return merged;
}

/* -------------------------------------------------------------------------------------------------
 * DayPicker slots
 * -------------------------------------------------------------------------------------------------*/

/**
 * Each cell carries its selection state as data attributes. The day button
 * styles off these (`group-data-*`), and calendar.css draws the range band on
 * the cell itself so it runs unbroken beneath the buttons.
 */
function CalendarDay({ day, modifiers, ...props }: DayProps) {
  const inRange = Boolean(modifiers.range_middle);
  const filled = Boolean(modifiers.selected) && !inRange;

  return (
    <td
      {...props}
      data-slot="calendar-day"
      data-filled={filled || undefined}
      data-in-range={inRange || undefined}
      data-muted={(day.outside && !filled && !inRange) || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-preview-start={modifiers.preview_start || undefined}
      data-preview-middle={modifiers.preview_middle || undefined}
      data-preview-end={modifiers.preview_end || undefined}
      data-preview-target={modifiers.preview_target || undefined}
    />
  );
}

function CalendarMonthCaption({
  calendarMonth,
  displayIndex,
  children,
  ...props
}: MonthCaptionProps) {
  const context = React.useContext(CalendarContext);
  const { dayPickerProps } = useDayPicker();

  if (!context?.drilldown) return <div {...props}>{children}</div>;

  const locale = dayPickerProps.locale?.code;
  const date = calendarMonth.date;
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(
    date,
  );

  return (
    <div {...props}>
      <button
        type="button"
        data-slot="calendar-caption-trigger"
        aria-label={`${month} ${year}, choose month and year`}
        aria-expanded={context.view !== "days"}
        onClick={() => context.openMonths(displayIndex)}
        className={cn(
          "-ms-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg ps-2 pe-1.5 text-sm",
          "hover:bg-surface-hover transition-[background-color,outline-color,outline-offset] duration-150 ease-out",
          "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        )}
      >
        <span className="font-medium">{month}</span>
        <span className="text-muted-foreground tabular-nums">{year}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="text-muted-foreground size-3.5"
        />
      </button>
      {/* DayPicker's caption label is a polite live region; keep it for
          screen readers so month changes are still announced. */}
      <span className="sr-only">{children}</span>
    </div>
  );
}

function CalendarPreviousMonthButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button {...props} className={cn(navButtonClassName, className)}>
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
    </button>
  );
}

function CalendarNextMonthButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button {...props} className={cn(navButtonClassName, className)}>
      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
    </button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Month and year grids
 * -------------------------------------------------------------------------------------------------*/

/** Arrow-key movement across a grid of buttons, reading columns from layout. */
function handleGridKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
  handlers: { onPrevious: () => void; onNext: () => void; onBack: () => void },
) {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    handlers.onBack();
    return;
  }
  if (event.key === "PageUp" || event.key === "PageDown") {
    event.preventDefault();
    if (event.key === "PageUp") handlers.onPrevious();
    else handlers.onNext();
    return;
  }

  const cells = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      "button[data-cell]:not(:disabled)",
    ),
  );
  const index = cells.indexOf(document.activeElement as HTMLButtonElement);
  if (index === -1) return;

  const top = cells[0].offsetTop;
  const columns = Math.max(
    1,
    cells.filter((cell) => cell.offsetTop === top).length,
  );
  const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
  const step = rtl ? -1 : 1;

  const moves: Record<string, number> = {
    ArrowLeft: -step,
    ArrowRight: step,
    ArrowUp: -columns,
    ArrowDown: columns,
    Home: -index,
    End: cells.length - 1 - index,
  };
  const move = moves[event.key];
  if (move === undefined) return;

  event.preventDefault();
  const next = cells[Math.min(Math.max(index + move, 0), cells.length - 1)];
  next.focus();
}

const gridCellClassName = cn(
  cellButtonClassName,
  "h-10 w-full self-center font-medium sm:h-9",
  "data-today:after:opacity-100",
  "data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary-hover data-active:after:bg-primary-foreground",
  "disabled:pointer-events-none disabled:opacity-40",
);

interface CalendarLayerProps {
  state: LayerState;
  label: string;
  title: React.ReactNode;
  previousLabel: string;
  nextLabel: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  children: React.ReactNode;
}

function CalendarLayer({
  state,
  label,
  title,
  previousLabel,
  nextLabel,
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
  onBack,
  children,
}: CalendarLayerProps) {
  return (
    <div
      role="group"
      aria-label={label}
      data-calendar-layer=""
      data-state={state}
      inert={state !== "active"}
      className="@container absolute inset-0 flex flex-col"
      onKeyDown={(event) =>
        handleGridKeyDown(event, {
          onPrevious: previousDisabled ? () => {} : onPrevious,
          onNext: nextDisabled ? () => {} : onNext,
          onBack,
        })
      }
    >
      <div className="relative mb-2 flex h-8 shrink-0 items-center justify-between">
        {title}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={navButtonClassName}
            aria-label={previousLabel}
            aria-disabled={previousDisabled || undefined}
            onClick={previousDisabled ? undefined : onPrevious}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={navButtonClassName}
            aria-label={nextLabel}
            aria-disabled={nextDisabled || undefined}
            onClick={nextDisabled ? undefined : onNext}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-3 gap-x-1 @md:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Calendar
 * -------------------------------------------------------------------------------------------------*/

/**
 * A month grid for picking a date, several dates, or a range. Built on React
 * DayPicker, so every DayPicker prop passes through.
 *
 * On top of DayPicker it adds: a caption that drills out to month and year
 * grids, a live preview while picking the end of a range, a selection that
 * slides between days, and animated month changes.
 */
function Calendar({
  className,
  classNames,
  components,
  modifiers,
  showOutsideDays,
  fixedWeeks = true,
  animate = true,
  captionLayout,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  onDayMouseEnter,
  onDayFocus,
  ...props
}: CalendarProps) {
  const today = props.today ?? new Date();
  const locale = props.locale?.code;
  const numberOfMonths = props.numberOfMonths ?? 1;
  const drilldown = captionLayout === undefined;

  const [month, setMonth] = useControllableState<Date>({
    value: monthProp,
    defaultValue: startOfMonth(
      defaultMonth ?? firstSelectedDate(props) ?? today,
    ),
    onValueChange: onMonthChange,
  });

  // Drill-down state. `drillIndex` is the displayed month whose caption opened
  // the grids, so picking a month puts it back in the same position.
  const [view, setView] = React.useState<CalendarView>("days");
  const [drillIndex, setDrillIndex] = React.useState(0);
  const [panelYear, setPanelYear] = React.useState(() => month.getFullYear());
  const [yearsStart, setYearsStart] = React.useState(0);
  // Remounting DayPicker after a grid pick skips its slide animation, which
  // would otherwise run underneath the zoom back into the days.
  const [pickerKey, setPickerKey] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pendingFocusRef = React.useRef(false);

  // Range preview: the hovered (or keyboard-focused) day while only the start
  // of a range is picked.
  const [hovered, setHovered] = React.useState<Date>();
  const range =
    props.mode === "range" ? (props.selected as DateRange | undefined) : null;
  const pickingEnd = Boolean(range?.from && !range.to);

  let previewModifiers: Record<string, Matcher | Matcher[] | undefined> = {};
  if (pickingEnd && range?.from && hovered && !isSameDay(hovered, range.from)) {
    const [start, end] =
      hovered < range.from ? [hovered, range.from] : [range.from, hovered];
    previewModifiers = {
      preview_start: start,
      preview_end: end,
      preview_middle: { after: start, before: end },
      preview_target: hovered,
    };
  }

  // The single-mode selection is one fill that slides between days
  // (calendar.css). It shows only while the selected day sits inside a
  // displayed month; elsewhere the day draws its own fill.
  const selectedDay =
    props.mode === "single" ? (props.selected as Date | undefined) : undefined;
  const firstShown = monthIndex(month);
  const showIndicator =
    selectedDay !== undefined &&
    monthIndex(selectedDay) >= firstShown &&
    monthIndex(selectedDay) < firstShown + numberOfMonths;

  const daysRef = React.useRef<HTMLDivElement>(null);
  const indicatorRef = React.useRef<HTMLSpanElement>(null);
  const placedRef = React.useRef<HTMLSpanElement | null>(null);

  // Offsets rather than bounding rects: they ignore transforms, so a popover's
  // open scale or the drill-down zoom can't skew the measurement.
  const placeIndicator = React.useCallback(() => {
    const layer = daysRef.current;
    const indicator = indicatorRef.current;
    if (!layer || !indicator) return;
    // Skip the outgoing month DayPicker keeps on screen while animating.
    const day = Array.from(
      layer.querySelectorAll<HTMLElement>(
        '[data-slot="calendar-day"][data-filled]:not([data-outside]) > button',
      ),
    ).find((button) => !button.closest('[aria-hidden="true"]'));
    if (!day) return;

    let x = 0;
    let y = 0;
    for (
      let node: HTMLElement | null = day;
      node && node !== layer;
      node = node.offsetParent as HTMLElement | null
    ) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }

    // A fresh fill is placed without sliding in from the corner; it settles
    // in with its @starting-style instead.
    const fresh = placedRef.current !== indicator;
    placedRef.current = indicator;
    if (fresh) indicator.style.transitionProperty = "opacity, scale";
    indicator.style.translate = `${x}px ${y}px`;
    indicator.style.width = `${day.offsetWidth}px`;
    indicator.style.height = `${day.offsetHeight}px`;
    if (fresh) {
      void indicator.offsetWidth;
      indicator.style.transitionProperty = "";
    }
  }, []);

  React.useLayoutEffect(placeIndicator);

  React.useEffect(() => {
    const layer = daysRef.current;
    if (!layer) return;
    const observer = new ResizeObserver(placeIndicator);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [placeIndicator]);

  const startBound = props.startMonth ? monthIndex(props.startMonth) : null;
  const endBound = props.endMonth ? monthIndex(props.endMonth) : null;
  const isMonthDisabled = (year: number, monthOfYear: number) => {
    const index = year * 12 + monthOfYear;
    return (
      (startBound !== null && index < startBound) ||
      (endBound !== null && index > endBound)
    );
  };
  const isYearDisabled = (year: number) =>
    (startBound !== null && (year + 1) * 12 - 1 < startBound) ||
    (endBound !== null && year * 12 > endBound);

  const openMonths = React.useCallback(
    (displayIndex: number) => {
      setDrillIndex(displayIndex);
      setPanelYear(addMonths(month, displayIndex).getFullYear());
      pendingFocusRef.current = true;
      setView("months");
    },
    [month],
  );

  const openYears = () => {
    setYearsStart(Math.floor(panelYear / YEARS_PER_PAGE) * YEARS_PER_PAGE);
    pendingFocusRef.current = true;
    setView("years");
  };

  const selectMonth = (monthOfYear: number) => {
    setMonth(new Date(panelYear, monthOfYear - drillIndex, 1));
    setPickerKey((key) => key + 1);
    pendingFocusRef.current = true;
    setView("days");
  };

  const selectYear = (year: number) => {
    setPanelYear(year);
    pendingFocusRef.current = true;
    setView("months");
  };

  const goBack = () => {
    pendingFocusRef.current = true;
    setView(view === "years" ? "months" : "days");
  };

  // Move focus into whichever view just became active. Inactive views are
  // inert, so without this focus would fall back to the body.
  React.useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    const root = rootRef.current;
    if (!root) return;
    const target =
      view === "days"
        ? root.querySelector<HTMLElement>(
            '[data-calendar-layer][data-state="active"] [data-slot="calendar-day"] button[tabindex="0"]',
          )
        : root.querySelector<HTMLElement>(
            `[data-calendar-layer][data-state="active"] button[data-cell][tabindex="0"]`,
          );
    target?.focus();
  }, [view, pickerKey]);

  const context = React.useMemo<CalendarContextValue>(
    () => ({ drilldown, view, openMonths }),
    [drilldown, view, openMonths],
  );

  const handleDayMouseEnter: DayEventHandler<React.MouseEvent> = (
    date,
    dayModifiers,
    event,
  ) => {
    if (pickingEnd) setHovered(date);
    onDayMouseEnter?.(date, dayModifiers, event);
  };

  const handleDayFocus: DayEventHandler<React.FocusEvent> = (
    date,
    dayModifiers,
    event,
  ) => {
    if (pickingEnd) setHovered(date);
    onDayFocus?.(date, dayModifiers, event);
  };

  const monthFormat = new Intl.DateTimeFormat(locale, { month: "short" });
  const monthLongFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const activeMonth = addMonths(month, drillIndex);
  const yearsEnd = yearsStart + YEARS_PER_PAGE - 1;

  const monthsState: LayerState =
    view === "months" ? "active" : view === "days" ? "outer" : "inner";

  return (
    <CalendarContext.Provider value={context}>
      <div
        ref={rootRef}
        data-slot="calendar"
        data-mode={props.mode}
        data-view={view}
        data-sliding={showIndicator || undefined}
        className={cn("relative w-fit p-3", className)}
        onMouseLeave={() => setHovered(undefined)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setHovered(undefined);
          }
        }}
      >
        <div className="relative">
          <div
            ref={daysRef}
            data-calendar-layer=""
            data-state={view === "days" ? "active" : "inner"}
            inert={view !== "days"}
            className="relative"
          >
            <DayPicker
              key={pickerKey}
              // Side by side, outside days would repeat the neighbouring
              // month's days (and any range drawn across them).
              showOutsideDays={showOutsideDays ?? numberOfMonths === 1}
              fixedWeeks={fixedWeeks}
              animate={animate}
              captionLayout={drilldown ? "label" : captionLayout}
              {...(props.mode === "range" ? { resetOnSelect: true } : null)}
              {...props}
              month={month}
              onMonthChange={setMonth}
              modifiers={{ ...previewModifiers, ...modifiers }}
              onDayMouseEnter={handleDayMouseEnter}
              onDayFocus={handleDayFocus}
              classNames={mergeClassNames(classNames)}
              components={{
                Day: CalendarDay,
                MonthCaption: CalendarMonthCaption,
                PreviousMonthButton: CalendarPreviousMonthButton,
                NextMonthButton: CalendarNextMonthButton,
                ...components,
              }}
            />
            {showIndicator && (
              <span
                ref={indicatorRef}
                aria-hidden
                data-slot="calendar-selection"
                className="calendar-selection"
              />
            )}
          </div>

          {drilldown && (
            <>
              <CalendarLayer
                state={monthsState}
                label="Choose a month"
                title={
                  <button
                    type="button"
                    aria-label={`${panelYear}, choose a year`}
                    onClick={openYears}
                    className={cn(
                      "-ms-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg ps-2 pe-1.5 text-sm font-medium tabular-nums",
                      "hover:bg-surface-hover transition-[background-color,outline-color,outline-offset] duration-150 ease-out",
                      "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
                    )}
                  >
                    {panelYear}
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      strokeWidth={2}
                      className="text-muted-foreground size-3.5"
                    />
                  </button>
                }
                previousLabel="Previous year"
                nextLabel="Next year"
                previousDisabled={isYearDisabled(panelYear - 1)}
                nextDisabled={isYearDisabled(panelYear + 1)}
                onPrevious={() => setPanelYear((year) => year - 1)}
                onNext={() => setPanelYear((year) => year + 1)}
                onBack={goBack}
              >
                {Array.from({ length: 12 }, (_, monthOfYear) => {
                  const date = new Date(panelYear, monthOfYear, 1);
                  const active =
                    panelYear === activeMonth.getFullYear() &&
                    monthOfYear === activeMonth.getMonth();
                  const isCurrent =
                    panelYear === today.getFullYear() &&
                    monthOfYear === today.getMonth();
                  return (
                    <button
                      key={monthOfYear}
                      type="button"
                      data-cell=""
                      data-active={active || undefined}
                      data-today={isCurrent || undefined}
                      aria-label={monthLongFormat.format(date)}
                      aria-current={active || undefined}
                      // In another year, January takes the tab stop.
                      tabIndex={
                        active ||
                        (panelYear !== activeMonth.getFullYear() &&
                          monthOfYear === 0)
                          ? 0
                          : -1
                      }
                      disabled={isMonthDisabled(panelYear, monthOfYear)}
                      onClick={() => selectMonth(monthOfYear)}
                      className={gridCellClassName}
                    >
                      {monthFormat.format(date)}
                    </button>
                  );
                })}
              </CalendarLayer>

              <CalendarLayer
                state={view === "years" ? "active" : "outer"}
                label="Choose a year"
                title={
                  <span className="text-sm font-medium tabular-nums">
                    {yearsStart}
                    <span className="text-muted-foreground"> – </span>
                    {yearsEnd}
                  </span>
                }
                previousLabel="Previous years"
                nextLabel="Next years"
                previousDisabled={isYearDisabled(yearsStart - 1)}
                nextDisabled={isYearDisabled(yearsEnd + 1)}
                onPrevious={() =>
                  setYearsStart((year) => year - YEARS_PER_PAGE)
                }
                onNext={() => setYearsStart((year) => year + YEARS_PER_PAGE)}
                onBack={goBack}
              >
                {Array.from({ length: YEARS_PER_PAGE }, (_, offset) => {
                  const year = yearsStart + offset;
                  const active = year === panelYear;
                  // With the active year paged out of view, the first year
                  // takes the tab stop instead.
                  const tabStop =
                    active ||
                    ((panelYear < yearsStart || panelYear > yearsEnd) &&
                      offset === 0);
                  return (
                    <button
                      key={year}
                      type="button"
                      data-cell=""
                      data-active={active || undefined}
                      data-today={year === today.getFullYear() || undefined}
                      aria-current={active || undefined}
                      tabIndex={tabStop ? 0 : -1}
                      disabled={isYearDisabled(year)}
                      onClick={() => selectYear(year)}
                      className={gridCellClassName}
                    >
                      {year}
                    </button>
                  );
                })}
              </CalendarLayer>
            </>
          )}
        </div>
      </div>
    </CalendarContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Presets
 * -------------------------------------------------------------------------------------------------*/

/**
 * A rail of one-click shortcuts that sits beside a calendar ("Today", "Last 7
 * days"). Vertical from `sm` up, a scrolling row of chips below it.
 */
function CalendarPresets({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      aria-label="Presets"
      data-slot="calendar-presets"
      className={cn(
        "flex shrink-0 gap-1 overflow-x-auto [scrollbar-width:none]",
        "sm:w-36 sm:flex-col sm:overflow-visible",
        className,
      )}
      {...props}
    />
  );
}

function CalendarPreset({
  className,
  active = false,
  ...props
}: React.ComponentProps<"button"> & {
  /** Marks the preset matching the current selection. */
  active?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="calendar-preset"
      data-active={active || undefined}
      aria-pressed={active}
      className={cn(
        "text-muted-foreground flex h-8 shrink-0 cursor-pointer items-center rounded-lg px-2.5 text-start text-sm whitespace-nowrap",
        "hover:bg-surface-hover hover:text-foreground",
        "data-active:bg-surface-hover data-active:text-foreground data-active:font-medium",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        "transition-[background-color,color,outline-color,outline-offset] duration-150 ease-out",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarPresets, CalendarPreset };
