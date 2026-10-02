"use client";

import * as React from "react";
import {
  dateMatchModifiers,
  DayPicker,
  useDayPicker,
  type DateRange,
  type DayEventHandler,
  type DayPickerProps,
  type DayProps,
  type Labels,
  type Matcher,
  type MonthCaptionProps,
  type MonthGridProps,
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
import { daysBetween, isSameDay } from "@/registry/default/lib/date-utils";
import { solidSurface } from "@/registry/default/lib/elevated";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
import { TextMorph } from "@/registry/default/text-morph/text-morph";

import {
  CalendarPicker,
  cellButtonClassName,
  focusRing,
} from "./calendar-picker";
import "./calendar.css";

/**
 * Screen-reader text for what the calendar adds on top of DayPicker, in
 * DayPicker's `label*` naming. Passed in `labels` beside DayPicker's own.
 */
export interface CalendarLabels {
  /** The caption button; `caption` is the formatted month and year. */
  labelCaptionTrigger: (caption: string) => string;
  /** The month and year picker panel. */
  labelMonthYearPicker: string;
  /** The picker's year column. */
  labelYears: string;
}

const DEFAULT_LABELS: CalendarLabels = {
  labelCaptionTrigger: (caption) => `${caption}, choose month and year`,
  labelMonthYearPicker: "Choose month and year",
  labelYears: "Year",
};

/** DayPicker's own labels plus the calendar's (`CalendarLabels`). */
export type CalendarLabelsProp = Partial<Labels> & Partial<CalendarLabels>;

export type CalendarProps = DayPickerProps & {
  /**
   * Draws the card the calendar sits on. Turn it off when the container
   * already is one, as the pickers' popover is.
   */
  framed?: boolean;
  labels?: CalendarLabelsProp;
};

interface RangeLanding {
  anchor: Date;
  target: Date;
}

/**
 * One cell's slice of the landing wipe, so the wipe's head follows a single
 * ease-out cubic across the whole range.
 */
function wipeTiming(
  step: number,
  span: number,
): { delay: number; duration: number } {
  const total = Math.min(
    Math.max(140 + span * WIPE_MS_PER_DAY, WIPE_MIN_MS),
    WIPE_MAX_MS,
  );
  const cells = span + 1;
  // Time at which an ease-out cubic, 1 - (1 - t)^3, reaches position p.
  const at = (position: number) => total * (1 - Math.cbrt(1 - position));
  const delay = at(step / cells);
  return { delay, duration: Math.max(at((step + 1) / cells) - delay, 1) };
}

interface CalendarContextValue {
  landing: RangeLanding | null;
  pickerEnabled: boolean;
  pickerOpen: boolean;
  pickerId: string;
  togglePicker: (displayIndex: number) => void;
  labelCaptionTrigger: CalendarLabels["labelCaptionTrigger"];
}

const CalendarContext = React.createContext<CalendarContextValue | null>(null);

/** Matches --calendar-enter-duration in calendar.css. */
const CAPTION_MORPH_MS = 280;

const WIPE_MIN_MS = 180;
const WIPE_MAX_MS = 300;
const WIPE_MS_PER_DAY = 12;

/** How far the year list reaches when `startMonth`/`endMonth` aren't set. */
const YEARS_BEFORE = 100;
const YEARS_AFTER = 25;

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

/**
 * Whether a day appears in a month's grid, including the neighbouring months'
 * days that fill its first and last weeks (and fixed weeks' extra rows).
 */
function isInGrid(
  day: Date,
  month: Date,
  { weekStartsOn, fixedWeeks }: { weekStartsOn: number; fixedWeeks: boolean },
): boolean {
  const first = startOfMonth(month);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() - weekStartsOn + 7) % 7));
  const end = new Date(start);
  if (fixedWeeks) {
    end.setDate(start.getDate() + 41);
  } else {
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    end.setFullYear(last.getFullYear(), last.getMonth(), last.getDate());
    end.setDate(end.getDate() + ((weekStartsOn + 6 - last.getDay()) % 7));
  }
  const time = new Date(day).setHours(0, 0, 0, 0);
  return time >= start.getTime() && time <= end.getTime();
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

// Corners concentric with the frame: 16px frame radius minus its 4px padding.
const navButtonClassName = cn(
  buttonVariants({ variant: "ghost", size: "icon_sm" }),
  "text-muted-foreground hover:text-foreground rounded-xl rtl:[&_svg]:-scale-x-100",
  "aria-disabled:pointer-events-none aria-disabled:opacity-40",
);

const DEFAULT_CLASS_NAMES: NonNullable<DayPickerProps["classNames"]> = {
  root: "relative w-fit",
  // The muted header strip. Side by side, months share one on the months row;
  // stacked, each month draws its own (classes repeated in full, since Tailwind
  // only generates literal classes).
  months: cn(
    "relative isolate flex flex-col gap-1 sm:flex-row sm:gap-x-4",
    "sm:before:absolute sm:before:inset-x-0 sm:before:top-0 sm:before:-z-1 sm:before:h-[calc(var(--calendar-header)-0.25rem)] sm:before:rounded-xl sm:before:bg-muted",
  ),
  // Fixed side columns keep the caption centred on a month without arrows.
  month: cn(
    "grid grid-cols-[2.25rem_1fr_2.25rem] grid-rows-[auto_1fr] gap-y-1 sm:grid-cols-[2rem_1fr_2rem]",
    "max-sm:relative max-sm:isolate",
    "max-sm:before:absolute max-sm:before:inset-x-0 max-sm:before:top-0 max-sm:before:-z-1 max-sm:before:h-[calc(var(--calendar-header)-0.25rem)] max-sm:before:rounded-xl max-sm:before:bg-muted",
  ),
  month_caption:
    "col-start-2 row-start-1 flex h-9 min-w-0 items-center justify-center sm:h-8",
  button_previous: "col-start-1 row-start-1 self-center justify-self-start",
  button_next: "col-start-3 row-start-1 self-center justify-self-end",
  caption_label: "text-sm font-medium",
  dropdowns: "flex items-center gap-2 text-sm font-medium",
  dropdown_root: "relative inline-flex items-center",
  dropdown: "absolute inset-0 cursor-pointer opacity-0",
  month_grid: "w-full border-separate border-spacing-x-0 border-spacing-y-0.5",
  weekdays: "",
  weekday: "text-muted-foreground h-8 w-10 p-0 text-xs font-medium sm:w-9",
  week_number_header: "h-8 w-10 p-0 sm:w-9",
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
    "group-data-filled/day:bg-primary group-data-filled/day:text-primary-foreground group-data-filled/day:hover:bg-(--primary-hover) group-data-filled/day:font-medium group-data-filled/day:after:bg-primary-foreground",
    // Disabled: struck through so it doesn't rely on colour alone
    "group-data-disabled/day:text-muted-foreground group-data-disabled/day:decoration-muted-foreground/60 group-data-disabled/day:line-through group-data-disabled/day:opacity-60",
  ),
  hidden: "invisible",
  // Month transitions, see calendar.css
  weeks_before_enter: "calendar-enter-from-start",
  weeks_before_exit: "calendar-exit-to-start",
  weeks_after_enter: "calendar-enter-from-end",
  weeks_after_exit: "calendar-exit-to-end",
  // Never empty: DayPicker adds these with classList.add, which throws on an
  // empty string.
  caption_before_enter: "calendar-caption-still",
  caption_before_exit: "calendar-caption-hold",
  caption_after_enter: "calendar-caption-still",
  caption_after_exit: "calendar-caption-hold",
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
 * Selection state goes on the cell as data attributes, so calendar.css can draw
 * the range band on the cell, unbroken beneath the buttons.
 */
function CalendarDay({ day, modifiers, style, ...props }: DayProps) {
  const context = React.useContext(CalendarContext);
  const { formatters, classNames, dayPickerProps } = useDayPicker();
  const { hidden, showOutsideDays } = dayPickerProps;

  // DayPicker hides days past `startMonth`/`endMonth`. Where they only fill
  // out an edge week, show them as unavailable so the month has no blank cells.
  if (
    modifiers.hidden &&
    day.outside &&
    showOutsideDays &&
    !(hidden && dateMatchModifiers(day.date, hidden, day.dateLib))
  ) {
    return (
      <td
        {...props}
        className={cn(props.className, "visible")}
        style={style}
        aria-hidden
        data-hidden={undefined}
        data-disabled=""
        data-slot="calendar-day"
        data-muted=""
      >
        <span className={classNames.day_button}>
          {formatters.formatDay(day.date, day.dateLib.options, day.dateLib)}
        </span>
      </td>
    );
  }
  const inRange = Boolean(modifiers.range_middle);
  const filled = Boolean(modifiers.selected) && !inRange;

  const landing = context?.landing;
  const banded =
    inRange || Boolean(modifiers.range_start || modifiers.range_end);
  const wipe =
    landing && banded
      ? wipeTiming(
          Math.abs(daysBetween(landing.anchor, day.date)),
          Math.abs(daysBetween(landing.anchor, landing.target)),
        )
      : null;

  return (
    <td
      {...props}
      style={
        wipe
          ? ({
              ...style,
              "--calendar-wipe-delay": `${wipe.delay}ms`,
              "--calendar-wipe-duration": `${wipe.duration}ms`,
            } as React.CSSProperties)
          : style
      }
      data-sweep={wipe ? "" : undefined}
      data-slot="calendar-day"
      data-landing-target={
        (landing && isSameDay(day.date, landing.target)) || undefined
      }
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

/**
 * Wraps DayPicker's table so the days card can stretch to the month beside it
 * while the table keeps its natural height.
 */
function CalendarMonthGrid(props: MonthGridProps) {
  const context = React.useContext(CalendarContext);
  const covered = Boolean(context?.pickerOpen);
  return (
    <div
      data-slot="calendar-grid"
      data-covered={covered || undefined}
      inert={covered}
      className="col-span-3 row-start-2 p-1"
    >
      <table {...props} />
    </div>
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

  if (!context?.pickerEnabled) return <div {...props}>{children}</div>;

  const caption = new Intl.DateTimeFormat(dayPickerProps.locale?.code, {
    month: "long",
    year: "numeric",
  }).format(calendarMonth.date);

  return (
    <div {...props}>
      <button
        type="button"
        data-slot="calendar-caption-trigger"
        aria-label={context.labelCaptionTrigger(caption)}
        aria-expanded={context.pickerOpen}
        aria-controls={context.pickerOpen ? context.pickerId : undefined}
        onClick={() => context.togglePicker(displayIndex)}
        className={cn(
          "inline-flex h-full cursor-pointer items-center gap-1.5 rounded-xl ps-2.5 pe-2 text-sm",
          "hover:bg-surface-hover aria-expanded:bg-surface-hover transition-[background-color,outline-color,outline-offset] duration-150 ease-out",
          focusRing,
        )}
      >
        {/* One label, so TextMorph eases the width change itself; two
            side-by-side labels shimmered. */}
        <TextMorph
          value={caption}
          duration={CAPTION_MORPH_MS}
          className="font-medium"
        />
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className={cn(
            "text-muted-foreground size-3.5 transition-[rotate] duration-200 ease-out motion-reduce:transition-none",
            context.pickerOpen && "rotate-180",
          )}
        />
      </button>
      {/* DayPicker's caption label is a polite live region; kept so month
          changes are still announced. */}
      <span className="sr-only">{children}</span>
    </div>
  );
}

function CalendarPreviousMonthButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      data-slot="calendar-nav"
      className={cn(navButtonClassName, className)}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
    </button>
  );
}

function CalendarNextMonthButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      data-slot="calendar-nav"
      className={cn(navButtonClassName, className)}
    >
      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
    </button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Motion state
 * -------------------------------------------------------------------------------------------------*/

/**
 * A range "lands" when a second click completes it. Tracked during render so
 * the first frame showing the full range already carries it; from an effect it
 * would paint once, then restart. Cleared after the wipe and cap settle, or
 * when the month changes so the incoming days don't replay it.
 */
function useRangeLanding(range: DateRange | undefined | null, month: number) {
  const rangeKey = range
    ? `${range.from?.getTime() ?? ""}:${range.to?.getTime() ?? ""}`
    : "";
  const [previous, setPrevious] = React.useState({
    key: rangeKey,
    month,
    from: range?.from,
    to: range?.to,
  });
  const [landing, setLanding] = React.useState<RangeLanding | null>(null);
  if (previous.key !== rangeKey || previous.month !== month) {
    const wasPicking = Boolean(previous.from && !previous.to);
    setPrevious({ key: rangeKey, month, from: range?.from, to: range?.to });
    if (
      previous.month === month &&
      wasPicking &&
      previous.from &&
      range?.from &&
      range.to &&
      !isSameDay(range.from, range.to)
    ) {
      const anchor = previous.from;
      setLanding({
        anchor,
        target: isSameDay(range.from, anchor) ? range.to : range.from,
      });
    } else {
      setLanding(null);
    }
  }

  React.useEffect(() => {
    if (!landing) return;
    const timeout = setTimeout(() => setLanding(null), 400);
    return () => clearTimeout(timeout);
  }, [landing]);

  return landing;
}

/**
 * How the selection fill enters when it remounts for a new month: with the
 * incoming days ("start"/"end"), or "instant" when DayPicker skips its
 * animation. `null` means a fresh selection, which settles in.
 */
function useFillEntrance(
  month: number,
  selected: number | undefined,
  pickerKey: number,
  dayFocused: boolean,
) {
  const [previous, setPrevious] = React.useState({
    month,
    selected,
    pickerKey,
  });
  const [entrance, setEntrance] = React.useState<
    "start" | "end" | "instant" | null
  >(null);
  if (
    previous.month !== month ||
    previous.selected !== selected ||
    previous.pickerKey !== pickerKey
  ) {
    setPrevious({ month, selected, pickerKey });
    if (previous.month === month) {
      setEntrance(null);
    } else if (previous.pickerKey !== pickerKey || dayFocused) {
      setEntrance("instant");
    } else {
      setEntrance(month > previous.month ? "end" : "start");
    }
  }
  return entrance;
}

/* -------------------------------------------------------------------------------------------------
 * Calendar
 * -------------------------------------------------------------------------------------------------*/

/**
 * A month grid for picking a date, several dates, or a range. Built on React
 * DayPicker, so every DayPicker prop passes through.
 *
 * On top of DayPicker it adds: a caption that opens a month and year picker,
 * a live preview while picking the end of a range, a selection that slides
 * between days, and animated month changes.
 */
function Calendar({
  className,
  classNames,
  components,
  modifiers,
  footer,
  framed = true,
  showOutsideDays,
  fixedWeeks: fixedWeeksProp,
  animate = true,
  captionLayout,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  onDayMouseEnter,
  onDayFocus,
  onDayBlur,
  labels,
  ...props
}: CalendarProps) {
  const {
    labelCaptionTrigger = DEFAULT_LABELS.labelCaptionTrigger,
    labelMonthYearPicker = DEFAULT_LABELS.labelMonthYearPicker,
    labelYears = DEFAULT_LABELS.labelYears,
    ...dayPickerLabels
  } = labels ?? {};
  const today = props.today ?? new Date();
  const locale = props.locale?.code;
  const numberOfMonths = props.numberOfMonths ?? 1;
  const pickerEnabled = captionLayout === undefined;
  const pickerId = React.useId();

  const [month, setMonth] = useControllableState<Date>({
    value: monthProp,
    defaultValue: startOfMonth(
      defaultMonth ?? firstSelectedDate(props) ?? today,
    ),
    onValueChange: onMonthChange,
  });

  // `pickerIndex` is the displayed month whose caption opened the picker, so a
  // picked month lands back in the same position.
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerIndex, setPickerIndex] = React.useState(0);
  const [pickerYear, setPickerYear] = React.useState(() => month.getFullYear());
  // Remounting DayPicker after a pick skips its slide animation, which would
  // otherwise run underneath the picker fading away.
  const [pickerKey, setPickerKey] = React.useState(0);
  // DayPicker skips its month animation while a day has keyboard focus, and
  // the selection fill follows suit.
  const [dayFocused, setDayFocused] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pendingFocusRef = React.useRef<"picker" | "days" | "caption" | null>(
    null,
  );

  // Range preview: the hovered (or keyboard-focused) day while picking a
  // range's end.
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

  // One month keeps six weeks so its height (and a popover around it) holds
  // still. Side by side, outside days are hidden, so fixed weeks would only
  // add blank rows. The sliding fill renders only while its day is on screen,
  // so it never slides in from a stale anchor.
  const showOutside = showOutsideDays ?? numberOfMonths === 1;
  const fixedWeeks = fixedWeeksProp ?? numberOfMonths === 1;
  const selectedDay =
    props.mode === "single" ? (props.selected as Date | undefined) : undefined;
  const firstShown = monthIndex(month);
  const landing = useRangeLanding(range, firstShown);
  const showIndicator =
    selectedDay !== undefined &&
    ((monthIndex(selectedDay) >= firstShown &&
      monthIndex(selectedDay) < firstShown + numberOfMonths) ||
      (numberOfMonths === 1 &&
        showOutside &&
        isInGrid(selectedDay, month, {
          weekStartsOn: props.ISOWeek
            ? 1
            : (props.weekStartsOn ?? props.locale?.options?.weekStartsOn ?? 0),
          fixedWeeks,
        })));

  // The fill remounts per month so it doesn't slide from the old month's spot.
  const fillEnter = useFillEntrance(
    firstShown,
    selectedDay?.getTime(),
    pickerKey,
    dayFocused,
  );

  const startBound = props.startMonth ? monthIndex(props.startMonth) : null;
  const endBound = props.endMonth ? monthIndex(props.endMonth) : null;
  const isMonthDisabled = (year: number, monthOfYear: number) => {
    const index = year * 12 + monthOfYear;
    return (
      (startBound !== null && index < startBound) ||
      (endBound !== null && index > endBound)
    );
  };
  const minYear =
    props.startMonth?.getFullYear() ?? today.getFullYear() - YEARS_BEFORE;
  const maxYear =
    props.endMonth?.getFullYear() ?? today.getFullYear() + YEARS_AFTER;

  const togglePicker = (displayIndex: number) => {
    if (pickerOpen) {
      setPickerOpen(false);
      return;
    }
    setPickerIndex(displayIndex);
    setPickerYear(addMonths(month, displayIndex).getFullYear());
    pendingFocusRef.current = "picker";
    setPickerOpen(true);
  };

  const closePicker = () => {
    pendingFocusRef.current = "caption";
    setPickerOpen(false);
  };

  const selectMonth = (monthOfYear: number) => {
    setMonth(new Date(pickerYear, monthOfYear - pickerIndex, 1));
    setPickerKey((key) => key + 1);
    pendingFocusRef.current = "days";
    setPickerOpen(false);
  };

  // The covered days are inert, so without this focus would fall back to the
  // body.
  React.useEffect(() => {
    const target = pendingFocusRef.current;
    pendingFocusRef.current = null;
    const root = rootRef.current;
    if (!target || !root) return;
    const selectors = {
      picker:
        '[data-slot="calendar-picker-months"] button[tabindex="0"]:not(:disabled)',
      days: '[data-slot="calendar-day"] button[tabindex="0"]',
      caption: '[data-slot="calendar-caption-trigger"]',
    };
    const candidates = root.querySelectorAll<HTMLElement>(selectors[target]);
    const element =
      target === "caption"
        ? (candidates[pickerIndex] ?? candidates[0])
        : candidates[0];
    element?.focus();
  }, [pickerOpen, pickerKey, pickerIndex]);

  const context: CalendarContextValue = {
    landing,
    pickerEnabled,
    pickerOpen,
    pickerId,
    togglePicker,
    labelCaptionTrigger,
  };

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
    setDayFocused(true);
    if (pickingEnd) setHovered(date);
    onDayFocus?.(date, dayModifiers, event);
  };

  const handleDayBlur: DayEventHandler<React.FocusEvent> = (
    date,
    dayModifiers,
    event,
  ) => {
    setDayFocused(false);
    onDayBlur?.(date, dayModifiers, event);
  };

  return (
    <CalendarContext.Provider value={context}>
      <div
        ref={rootRef}
        data-slot="calendar"
        data-mode={props.mode}
        data-framed={framed || undefined}
        data-picker-open={pickerOpen || undefined}
        data-range-landing={
          landing
            ? landing.target > landing.anchor
              ? "forward"
              : "backward"
            : undefined
        }
        className={cn(
          "relative w-fit [--calendar-header:2.5rem] sm:[--calendar-header:2.25rem]",
          framed && cn("rounded-2xl p-1", solidSurface(3, 1)),
          className,
        )}
        onMouseLeave={() => setHovered(undefined)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setHovered(undefined);
          }
        }}
      >
        {/* Own stack, so the selection fill (z -1) sits under the days
            without dropping behind the card. */}
        <div className="relative isolate">
          <DayPicker
            key={pickerKey}
            // Side by side, outside days would repeat the neighbouring
            // month's days (and any range drawn across them).
            showOutsideDays={showOutside}
            fixedWeeks={fixedWeeks}
            animate={animate}
            navLayout="around"
            captionLayout={pickerEnabled ? "label" : captionLayout}
            {...(props.mode === "range" ? { resetOnSelect: true } : null)}
            {...props}
            labels={dayPickerLabels}
            month={month}
            onMonthChange={setMonth}
            modifiers={{ ...previewModifiers, ...modifiers }}
            onDayMouseEnter={handleDayMouseEnter}
            onDayFocus={handleDayFocus}
            onDayBlur={handleDayBlur}
            classNames={mergeClassNames(classNames)}
            components={{
              Day: CalendarDay,
              MonthGrid: CalendarMonthGrid,
              MonthCaption: CalendarMonthCaption,
              PreviousMonthButton: CalendarPreviousMonthButton,
              NextMonthButton: CalendarNextMonthButton,
              ...components,
            }}
          />
          {showIndicator && (
            <span
              key={firstShown}
              aria-hidden
              data-slot="calendar-selection"
              data-enter={fillEnter ?? undefined}
              className="calendar-selection"
            />
          )}
          {pickerEnabled && (
            <CalendarPicker
              id={pickerId}
              open={pickerOpen}
              year={pickerYear}
              onYearChange={setPickerYear}
              minYear={minYear}
              maxYear={maxYear}
              activeMonth={addMonths(month, pickerIndex)}
              today={today}
              locale={locale}
              isMonthDisabled={isMonthDisabled}
              onSelectMonth={selectMonth}
              onClose={closePicker}
              label={labelMonthYearPicker}
              yearsLabel={labelYears}
            />
          )}
        </div>
        {footer && (
          <div
            role="status"
            aria-live="polite"
            data-slot="calendar-footer"
            className="text-muted-foreground px-2 pt-2 pb-1 text-sm"
          >
            {footer}
          </div>
        )}
      </div>
    </CalendarContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Presets
 * -------------------------------------------------------------------------------------------------*/

/**
 * A rail of one-click shortcuts that sits beside a calendar ("Today", "Last 7
 * days"). Vertical from `sm` up, a scrolling row of chips below it. Classes
 * go on the outer scroll area; other props on the group inside.
 */
function CalendarPresets({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ScrollArea
      fadeEdges="x"
      hideScrollbar
      contentMinWidth="fit-content"
      // h-auto lets the rail stretch to the calendar (ScrollArea's full height
      // resolves to nothing there). w-0/min-w-full keeps the chip row from
      // widening its container.
      className={cn(
        "h-auto shrink-0 max-sm:w-0 max-sm:min-w-full sm:w-36",
        className,
      )}
    >
      <div
        role="group"
        aria-label="Presets"
        data-slot="calendar-presets"
        className="flex gap-1 sm:flex-col"
        {...props}
      />
    </ScrollArea>
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
        focusRing,
        // Hover changes colour instantly, like the days.
        "transition-[outline-color,outline-offset] duration-150 ease-out",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarPresets, CalendarPreset };
