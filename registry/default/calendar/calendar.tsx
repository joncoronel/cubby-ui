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
import { solidSurface } from "@/registry/default/lib/elevated";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
import { TextMorph } from "@/registry/default/text-morph/text-morph";

import "./calendar.css";

export type CalendarProps = DayPickerProps & {
  /**
   * Draws the card the calendar sits on. Turn it off when the container
   * already is one, as the pickers' popover is.
   */
  framed?: boolean;
};

/** A range that just completed: where it was started, and the day that ended it. */
interface RangeLanding {
  anchor: Date;
  target: Date;
}

/** Days between two dates, ignoring the time of day (and DST shifts). */
function daysBetween(a: Date, b: Date): number {
  return Math.round(
    (new Date(b).setHours(0, 0, 0, 0) - new Date(a).setHours(0, 0, 0, 0)) /
      DAY_MS,
  );
}

/**
 * One cell's slice of the landing wipe. The wipe's head follows an ease-out
 * cubic over the whole range, so each cell gets the time the curve spends
 * crossing it: short slices near the start, longer ones settling into the
 * end. Longer ranges take a little longer overall, within a fixed window.
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
  /** True when the caption opens the month and year picker. */
  pickerEnabled: boolean;
  pickerOpen: boolean;
  pickerId: string;
  togglePicker: (displayIndex: number) => void;
}

const CalendarContext = React.createContext<CalendarContextValue | null>(null);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Caption text morph, timed to the days' enter (calendar.css). */
const CAPTION_MORPH_MS = 280;

/** The landing wipe's length: grows with the range, within these bounds. */
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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Whether a day appears in a single month's grid, counting the neighbouring
 * months' days that fill out its first and last weeks (and, with fixed weeks,
 * the extra rows that make six).
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

const focusRing =
  "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2";

// Corners concentric with the frame: 16px frame radius minus its 4px padding.
const navButtonClassName = cn(
  buttonVariants({ variant: "ghost", size: "icon_sm" }),
  "text-muted-foreground hover:text-foreground rounded-xl rtl:[&_svg]:-scale-x-100",
  "aria-disabled:pointer-events-none aria-disabled:opacity-40",
);

const cellButtonClassName = cn(
  // Layout
  "relative z-1 flex size-full items-center justify-center rounded-lg text-sm tabular-nums",
  // Focus
  focusRing,
  "focus-visible:z-2",
  // Interaction
  // Hover and selection colours change instantly: days are crossed dozens of
  // times a pass, and a fade would trail the pointer.
  "cursor-pointer transition-[scale,outline-color,outline-offset] duration-150 ease-out active:scale-[0.96] motion-reduce:active:scale-100",
  "hover:bg-surface-hover",
  // Today: a dot under the number, re-coloured when the day is filled
  "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-1 after:mx-auto after:size-1 after:rounded-full after:bg-primary after:opacity-0",
);

const DEFAULT_CLASS_NAMES: NonNullable<DayPickerProps["classNames"]> = {
  root: "relative w-fit",
  // The muted strip behind the header row (arrows and captions), painted
  // behind it (-z-1 in an isolated stack). Side by side, months share one
  // strip drawn on the months row; stacked, each month draws its own. Spelled
  // out in full for each breakpoint: Tailwind only generates literal classes.
  months: cn(
    "relative isolate flex flex-col gap-1 sm:flex-row sm:gap-x-4",
    "sm:before:absolute sm:before:inset-x-0 sm:before:top-0 sm:before:-z-1 sm:before:h-[calc(var(--calendar-header)-0.25rem)] sm:before:rounded-xl sm:before:bg-muted",
  ),
  // Header row on the strip (arrow, caption, arrow), then the days. Fixed
  // side columns keep the caption centred even on a month without arrows.
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
  // The caption morphs its text instead of moving (see calendar.css for why
  // the outgoing one still needs an animation). Never empty: DayPicker adds
  // these with classList.add, which throws on an empty string.
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
 * Each cell carries its selection state as data attributes. The day button
 * styles off these (`group-data-*`), and calendar.css draws the range band on
 * the cell itself so it runs unbroken beneath the buttons.
 */
function CalendarDay({ day, modifiers, style, ...props }: DayProps) {
  const context = React.useContext(CalendarContext);
  const inRange = Boolean(modifiers.range_middle);
  const filled = Boolean(modifiers.selected) && !inRange;

  // While a range lands, each of its days takes its slice of one wipe from
  // where the range was started toward the day that completed it.
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
 * The days card, wrapping DayPicker's table so the card can stretch to the
 * month beside it while the table keeps its natural height. Covered (and
 * inert) while the month picker is open.
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
        aria-label={`${caption}, choose month and year`}
        aria-expanded={context.pickerOpen}
        aria-controls={context.pickerOpen ? context.pickerId : undefined}
        onClick={() => context.togglePicker(displayIndex)}
        className={cn(
          "inline-flex h-full cursor-pointer items-center gap-1.5 rounded-xl ps-2.5 pe-2 text-sm",
          "hover:bg-surface-hover aria-expanded:bg-surface-hover transition-[background-color,outline-color,outline-offset] duration-150 ease-out",
          focusRing,
        )}
      >
        {/* One label, so TextMorph handles the caption's change of width
            itself: only the letters that differ move, and the box eases
            without the shimmer two side-by-side labels caused. */}
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
 * Month and year picker
 * -------------------------------------------------------------------------------------------------*/

/** Arrow-key movement across a grid of buttons, reading columns from layout. */
function moveInGrid(event: React.KeyboardEvent<HTMLElement>): void {
  const cells = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
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
  cells[Math.min(Math.max(index + move, 0), cells.length - 1)].focus();
}

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
}

/**
 * One panel over the days: a scrolling year column beside the year's twelve
 * months. Picking a year only changes which months are shown; picking a month
 * goes there and closes. The caption above stays visible as the way back.
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
}: CalendarPickerProps) {
  const yearsRef = React.useRef<HTMLDivElement>(null);
  const focusYearRef = React.useRef(false);

  // Centre the chosen year in its column whenever the picker opens.
  React.useLayoutEffect(() => {
    if (!open) return;
    const list = yearsRef.current;
    const active = list?.querySelector<HTMLElement>("[data-active]");
    if (!list || !active) return;
    list.scrollTop =
      active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
  }, [open]);

  // Keyboard moves in the year column select as they go; follow with focus.
  React.useEffect(() => {
    if (!focusYearRef.current) return;
    focusYearRef.current = false;
    const active =
      yearsRef.current?.querySelector<HTMLElement>("[data-active]");
    active?.focus();
    active?.scrollIntoView({ block: "nearest" });
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
  const activeInYear = activeMonth.getFullYear() === year;

  return (
    <div
      id={id}
      role="group"
      aria-label="Choose month and year"
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
          aria-label="Year"
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
                aria-pressed={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onYearChange(option)}
                className={cn(
                  cellButtonClassName,
                  "text-muted-foreground h-8 w-full shrink-0",
                  "data-today:after:opacity-100",
                  "data-active:text-foreground data-active:bg-surface-hover data-active:font-semibold",
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
        data-slot="calendar-picker-months"
        className="grid flex-1 auto-rows-fr grid-cols-3 gap-x-1 p-1"
        onKeyDown={(event) => {
          if (event.key === "PageUp" || event.key === "PageDown") {
            event.preventDefault();
            onYearChange(
              Math.min(
                Math.max(year + (event.key === "PageUp" ? -1 : 1), minYear),
                maxYear,
              ),
            );
            return;
          }
          moveInGrid(event);
        }}
      >
        {Array.from({ length: 12 }, (_, monthOfYear) => {
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
              // In another year, January takes the tab stop.
              tabIndex={active || (!activeInYear && monthOfYear === 0) ? 0 : -1}
              disabled={isMonthDisabled(year, monthOfYear)}
              onClick={() => onSelectMonth(monthOfYear)}
              className={cn(
                cellButtonClassName,
                "h-9 w-full self-center font-medium sm:h-8",
                "data-today:after:opacity-100",
                "data-active:bg-primary data-active:text-primary-foreground data-active:after:bg-primary-foreground data-active:hover:bg-(--primary-hover)",
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
  ...props
}: CalendarProps) {
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

  // Month and year picker. `pickerIndex` is the displayed month whose caption
  // opened it, so picking a month puts it back in the same position.
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pickerIndex, setPickerIndex] = React.useState(0);
  const [pickerYear, setPickerYear] = React.useState(() => month.getFullYear());
  // Remounting DayPicker after a pick skips its slide animation, which would
  // otherwise run underneath the picker fading away.
  const [pickerKey, setPickerKey] = React.useState(0);
  // Whether a day has keyboard focus: DayPicker skips its month animation
  // then, and the selection fill follows suit.
  const [dayFocused, setDayFocused] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pendingFocusRef = React.useRef<"picker" | "days" | "caption" | null>(
    null,
  );

  // Range preview: the hovered (or keyboard-focused) day while only the start
  // of a range is picked.
  const [hovered, setHovered] = React.useState<Date>();
  const range =
    props.mode === "range" ? (props.selected as DateRange | undefined) : null;
  const pickingEnd = Boolean(range?.from && !range.to);

  // A range "lands" when a second click completes it. Tracked while
  // rendering, so the frame that first shows the full range already carries
  // the landing; from an effect it would paint once, then restart.
  const rangeKey = range
    ? `${range.from?.getTime() ?? ""}:${range.to?.getTime() ?? ""}`
    : "";
  const [previousRange, setPreviousRange] = React.useState({
    key: rangeKey,
    from: range?.from,
    to: range?.to,
  });
  const [landing, setLanding] = React.useState<RangeLanding | null>(null);
  if (previousRange.key !== rangeKey) {
    const wasPicking = Boolean(previousRange.from && !previousRange.to);
    setPreviousRange({ key: rangeKey, from: range?.from, to: range?.to });
    if (
      wasPicking &&
      previousRange.from &&
      range?.from &&
      range.to &&
      !isSameDay(range.from, range.to)
    ) {
      const anchor = previousRange.from;
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
    const timeout = setTimeout(() => setLanding(null), 900);
    return () => clearTimeout(timeout);
  }, [landing]);

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

  // The single-mode selection is one fill, anchored to the selected day in
  // CSS, that slides between days (calendar.css). It renders only while the
  // selected day is on screen, so it has no stale anchor to slide from when
  // that day comes back into view. With one month shown, that includes the
  // neighbouring months' days filling out its first and last weeks.
  // One month keeps six weeks, so its height (and a popover around it) holds
  // still from month to month; the extra rows fill with the next month's
  // days. Side by side those days are hidden, so fixed weeks would only add
  // blank rows.
  const showOutside = showOutsideDays ?? numberOfMonths === 1;
  const fixedWeeks = fixedWeeksProp ?? numberOfMonths === 1;
  const selectedDay =
    props.mode === "single" ? (props.selected as Date | undefined) : undefined;
  const firstShown = monthIndex(month);
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

  // When the month changes, the fill arrives with the incoming days: it is
  // remounted (so it doesn't slide over from the old month's spot) and runs
  // the weeks' own entrance (calendar.css), travelling the same way. Not when
  // DayPicker skips its animation: a keyboard-focused day, or a jump from the
  // month picker. Picking another day afterwards slides it as usual.
  const selectedTime = selectedDay?.getTime();
  const [previousFill, setPreviousFill] = React.useState({
    month: firstShown,
    selected: selectedTime,
    pickerKey,
  });
  const [fillEnter, setFillEnter] = React.useState<"start" | "end" | null>(
    null,
  );
  if (
    previousFill.month !== firstShown ||
    previousFill.selected !== selectedTime ||
    previousFill.pickerKey !== pickerKey
  ) {
    setPreviousFill({ month: firstShown, selected: selectedTime, pickerKey });
    const animated =
      previousFill.month !== firstShown &&
      previousFill.pickerKey === pickerKey &&
      !dayFocused;
    setFillEnter(
      animated ? (firstShown > previousFill.month ? "end" : "start") : null,
    );
  }

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

  // Move focus to where the user now is. The covered days are inert, so
  // without this focus would fall back to the body.
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
          // A surface card with the header in a muted strip inside it.
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
        {/* Its own stack, so the selection fill (z -1) can sit under the
            days, which share the months row's isolated stack with the header
            strip, without dropping behind the card. */}
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
        focusRing,
        "transition-[background-color,color,outline-color,outline-offset] duration-150 ease-out",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarPresets, CalendarPreset };
