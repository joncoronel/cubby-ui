/**
 * Forgiving parsers for dates people type: "tomorrow", "next fri", "in 3
 * weeks", "mar 14", "14 March 2027", "3/14", "2026-03-14", and ranges such as
 * "Oct 1 – 8, 2026" or "last 30 days". Numeric dates follow the locale's
 * day/month order. Everything resolves to local midnight.
 */

import { startOfDay } from "@/registry/default/lib/date-utils";

export interface ParseDateOptions {
  /** The "today" that relative input resolves against. Defaults to now. */
  referenceDate?: Date;
  /** BCP 47 locale for month and weekday names and numeric order. */
  locale?: string;
}

export interface ParsedDateRange {
  from: Date;
  to: Date;
}

interface DateParts {
  year?: number;
  month?: number;
  day?: number;
}

type Parsed = { date: Date } | { parts: DateParts };

type Unit = "day" | "week" | "month" | "year";

const UNITS: Record<string, Unit> = {
  d: "day",
  day: "day",
  days: "day",
  w: "week",
  wk: "week",
  wks: "week",
  week: "week",
  weeks: "week",
  mo: "month",
  mos: "month",
  month: "month",
  months: "month",
  y: "year",
  yr: "year",
  yrs: "year",
  year: "year",
  years: "year",
};

const KEYWORDS: Record<string, number> = {
  today: 0,
  tod: 0,
  now: 0,
  tomorrow: 1,
  tmr: 1,
  tmrw: 1,
  tom: 1,
  yesterday: -1,
  yday: -1,
};

/** Own entries only, so names like "constructor" aren't found on Object. */
function unitOf(name: string): Unit | undefined {
  return Object.hasOwn(UNITS, name) ? UNITS[name] : undefined;
}

function keywordOf(name: string): number | undefined {
  return Object.hasOwn(KEYWORDS, name) ? KEYWORDS[name] : undefined;
}

const MIN_YEAR = 1;
const MAX_YEAR = 9999;

/**
 * Null for out-of-range years and Invalid Date, which huge input like
 * "in 99999999 years" produces and which throws when formatted.
 */
function valid(date: Date | null): Date | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  return year >= MIN_YEAR && year <= MAX_YEAR ? date : null;
}

const RANGE_SEPARATOR = /\s+(?:-|to|until|till|through|thru)\s+|\s*[–—]\s*/;

/* -------------------------------------------------------------------------------------------------
 * Date arithmetic
 * -------------------------------------------------------------------------------------------------*/

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Adds whole units. Months and years clamp to the end of a shorter month. */
function add(date: Date, amount: number, unit: Unit): Date {
  if (unit === "day" || unit === "week") {
    const days = unit === "week" ? amount * 7 : amount;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }
  const months = unit === "year" ? amount * 12 : amount;
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const day = Math.min(
    date.getDate(),
    daysInMonth(target.getFullYear(), target.getMonth()),
  );
  return new Date(target.getFullYear(), target.getMonth(), day);
}

/* -------------------------------------------------------------------------------------------------
 * Locale names
 * -------------------------------------------------------------------------------------------------*/

const nameCache = new Map<string, Map<string, number>>();

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\.$/, "");
}

/** Month names (long and short) in the locale and English, to month index. */
function monthNames(locale: string | undefined): Map<string, number> {
  const key = `month:${locale ?? ""}`;
  const cached = nameCache.get(key);
  if (cached) return cached;

  const names = new Map<string, number>();
  for (const loc of new Set([locale, "en"])) {
    for (const width of ["long", "short"] as const) {
      const format = new Intl.DateTimeFormat(loc, { month: width });
      for (let month = 0; month < 12; month++) {
        names.set(
          normalizeName(format.format(new Date(2000, month, 1))),
          month,
        );
      }
    }
  }
  names.set("sept", 8);
  nameCache.set(key, names);
  return names;
}

/** Weekday names (long and short) in the locale and English, to 0–6. */
function weekdayNames(locale: string | undefined): Map<string, number> {
  const key = `weekday:${locale ?? ""}`;
  const cached = nameCache.get(key);
  if (cached) return cached;

  const names = new Map<string, number>();
  for (const loc of new Set([locale, "en"])) {
    for (const width of ["long", "short"] as const) {
      const format = new Intl.DateTimeFormat(loc, { weekday: width });
      // 2 January 2000 was a Sunday.
      for (let weekday = 0; weekday < 7; weekday++) {
        names.set(
          normalizeName(format.format(new Date(2000, 0, 2 + weekday))),
          weekday,
        );
      }
    }
  }
  for (const [name, weekday] of Object.entries({
    tues: 2,
    weds: 3,
    thur: 4,
    thurs: 4,
  })) {
    names.set(name, weekday);
  }
  nameCache.set(key, names);
  return names;
}

/** Whether the locale writes the day before the month in numeric dates. */
function isDayFirst(locale: string | undefined): boolean {
  const parts = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
  }).formatToParts(new Date(2000, 10, 22));
  const day = parts.findIndex((part) => part.type === "day");
  const month = parts.findIndex((part) => part.type === "month");
  return day < month;
}

/** Expands a two-digit year to the century that lands within 20 years ahead. */
function expandYear(year: number, reference: Date): number {
  if (year >= 100) return year;
  const current = reference.getFullYear();
  let full = Math.floor(current / 100) * 100 + year;
  if (full > current + 20) full -= 100;
  return full;
}

/* -------------------------------------------------------------------------------------------------
 * Single dates
 * -------------------------------------------------------------------------------------------------*/

function parseRelative(text: string, reference: Date): Date | null {
  const keyword = keywordOf(text);
  if (keyword !== undefined) return add(reference, keyword, "day");

  // "in 3 days", "+2w", "3 weeks"
  const ahead = text.match(/^(?:in\s+|\+)?(\d+)\s*([a-z]+)$/);
  const aheadUnit = ahead && unitOf(ahead[2]);
  if (ahead && aheadUnit) return add(reference, Number(ahead[1]), aheadUnit);

  // "-2w", "3 days ago"
  const behind =
    text.match(/^-(\d+)\s*([a-z]+)$/) ?? text.match(/^(\d+)\s*([a-z]+)\s+ago$/);
  const behindUnit = behind && unitOf(behind[2]);
  if (behind && behindUnit) {
    return add(reference, -Number(behind[1]), behindUnit);
  }

  // "next week", "last month", "this year"
  const step = text.match(/^(next|last|this)\s+([a-z]+)$/);
  const stepUnit = step && unitOf(step[2]);
  if (step && stepUnit) {
    const direction = { next: 1, last: -1, this: 0 }[step[1] as "next"];
    return add(reference, direction, stepUnit);
  }

  return null;
}

function parseWeekday(
  text: string,
  reference: Date,
  locale: string | undefined,
): Date | null {
  const match = text.match(/^(?:(next|last|this|on)\s+)?([^\s\d]+)$/);
  if (!match) return null;
  const weekday = weekdayNames(locale).get(normalizeName(match[2]));
  if (weekday === undefined) return null;

  const today = reference.getDay();
  if (match[1] === "last") {
    // The most recent one before today.
    return add(reference, -(((today - weekday + 6) % 7) + 1), "day");
  }
  if (match[1] === "next") {
    // The first one after today.
    return add(reference, ((weekday - today + 6) % 7) + 1, "day");
  }
  // Bare or "this": today if it matches, otherwise the next one.
  return add(reference, (weekday - today + 7) % 7, "day");
}

function parseNumeric(
  text: string,
  reference: Date,
  locale: string | undefined,
): DateParts | null {
  // Year first is unambiguous: 2026-03-14, 2026/3/14.
  const yearFirst = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (yearFirst) {
    return {
      year: Number(yearFirst[1]),
      month: Number(yearFirst[2]) - 1,
      day: Number(yearFirst[3]),
    };
  }

  const short = text.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2}|\d{4}))?$/);
  if (!short) return null;
  const [first, second] = [Number(short[1]), Number(short[2])];
  const [day, month] = isDayFirst(locale) ? [first, second] : [second, first];
  return {
    day,
    month: month - 1,
    year: short[3] ? expandYear(Number(short[3]), reference) : undefined,
  };
}

/** Word dates in any order: "mar 14", "14th of march 2027", "thu oct 1". */
function parseWords(
  text: string,
  reference: Date,
  locale: string | undefined,
): DateParts | null {
  const months = monthNames(locale);
  const weekdays = weekdayNames(locale);
  const parts: DateParts = {};

  for (const raw of text.split(" ")) {
    const token = normalizeName(raw);
    if (!token || token === "of" || token === "the") continue;

    // Months first: in some locales a weekday and a month share a short name
    // ("mar" is Tuesday and March in Spanish and Italian).
    const month = months.get(token);
    if (month !== undefined) {
      if (parts.month !== undefined) return null;
      parts.month = month;
      continue;
    }

    // A weekday alongside a full date ("Thu, Oct 1") is redundant.
    if (weekdays.has(token)) continue;

    const number = token.match(/^'?(\d+)(?:st|nd|rd|th)?$/);
    if (!number) return null;
    const value = Number(number[1]);
    const isYear =
      number[1].length >= 3 || raw.startsWith("'") || parts.day !== undefined;
    if (isYear) {
      if (parts.year !== undefined) return null;
      parts.year = expandYear(value, reference);
    } else {
      parts.day = value;
    }
  }

  return Object.keys(parts).length > 0 ? parts : null;
}

function parseOne(
  input: string,
  reference: Date,
  locale: string | undefined,
): Parsed | null {
  const text = input
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");
  if (!text) return null;

  const relative =
    parseRelative(text, reference) ?? parseWeekday(text, reference, locale);
  if (relative) return { date: relative };

  const parts =
    parseNumeric(text, reference, locale) ??
    parseWords(text, reference, locale);
  return parts ? { parts } : null;
}

/** Fills missing parts from the reference date; rejects impossible days. */
function resolve(parts: DateParts, reference: Date): Date | null {
  const year = parts.year ?? reference.getFullYear();
  const month = parts.month ?? reference.getMonth();
  // A month on its own ("march 2027") means its first day.
  const day =
    parts.day ?? (parts.month !== undefined ? 1 : reference.getDate());
  if (year < MIN_YEAR || year > MAX_YEAR) return null;
  if (month < 0 || month > 11 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  return new Date(year, month, day);
}

/**
 * Reads a typed date. Returns `null` when the text isn't a date it
 * understands, or names a day that doesn't exist ("feb 30").
 */
export function parseDate(
  input: string,
  options: ParseDateOptions = {},
): Date | null {
  const reference = startOfDay(options.referenceDate ?? new Date());
  const parsed = parseOne(input, reference, options.locale);
  if (!parsed) return null;
  return valid(
    "date" in parsed ? parsed.date : resolve(parsed.parts, reference),
  );
}

function dateOf(parsed: Parsed): Date | null {
  return "date" in parsed ? parsed.date : null;
}

function checkedRange(range: ParsedDateRange): ParsedDateRange | null {
  const from = valid(range.from);
  const to = valid(range.to);
  return from && to ? { from, to } : null;
}

/* -------------------------------------------------------------------------------------------------
 * Ranges
 * -------------------------------------------------------------------------------------------------*/

function parseRelativeRange(
  text: string,
  reference: Date,
): ParsedDateRange | null {
  // "last 7 days", "past 2 weeks", "next 30 days"
  const match = text.match(/^(last|past|next)\s+(\d+)\s*([a-z]+)$/);
  const unit = match && unitOf(match[3]);
  if (!match || !unit) return null;
  const amount = Number(match[2]);
  if (amount < 1) return null;
  if (match[1] === "next") {
    return {
      from: reference,
      to: add(add(reference, amount, unit), -1, "day"),
    };
  }
  return { from: add(add(reference, -amount, unit), 1, "day"), to: reference };
}

/**
 * Reads a typed range: two dates joined by a dash, "to", or "until", or a
 * relative span like "last 7 days". The second date borrows a missing month
 * or year from the first ("Oct 1 – 8"), the first borrows a missing year from
 * the second ("Oct 1 – 8, 2026"), and a range written backwards is flipped. A
 * single date reads as a one-day range.
 */
export function parseDateRange(
  input: string,
  options: ParseDateOptions = {},
): ParsedDateRange | null {
  const reference = startOfDay(options.referenceDate ?? new Date());
  const { locale } = options;
  const text = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (!text) return null;

  const relative = parseRelativeRange(text, reference);
  if (relative) return checkedRange(relative);

  const sides = text.split(RANGE_SEPARATOR);
  if (sides.length === 1) {
    const date = parseDate(text, options);
    return date ? { from: date, to: date } : null;
  }
  if (sides.length !== 2) return null;

  const start = parseOne(sides[0], reference, locale);
  const end = parseOne(sides[1], reference, locale);
  if (!start || !end) return null;

  const startParts = "parts" in start ? { ...start.parts } : null;
  const endParts = "parts" in end ? { ...end.parts } : null;
  // Whether a side's year came from the other side rather than the text.
  let startYearBorrowed = false;
  let endYearBorrowed = false;

  if (startParts && endParts) {
    endParts.month ??= startParts.month;
    if (endParts.year === undefined && startParts.year !== undefined) {
      endParts.year = startParts.year;
      endYearBorrowed = true;
    } else if (startParts.year === undefined && endParts.year !== undefined) {
      startParts.year = endParts.year;
      startYearBorrowed = true;
    }
  }

  let from = startParts ? resolve(startParts, reference) : dateOf(start);
  if (!from) return null;
  // A bare end ("today – 14") fills in from the start, not from today.
  let to = endParts ? resolve(endParts, from) : dateOf(end);
  if (!to) return null;

  if (to < from && to.getMonth() < from.getMonth()) {
    // Running backwards across months with an inferred year means the range
    // crosses New Year: "Dec 28 – Jan 4" ends in the January after.
    if (startParts && startYearBorrowed) {
      from = resolve({ ...startParts, year: to.getFullYear() - 1 }, reference);
    } else if (endParts && (endYearBorrowed || endParts.year === undefined)) {
      to = resolve({ ...endParts, year: from.getFullYear() + 1 }, from);
    }
    if (!from || !to) return null;
  }
  return checkedRange(to < from ? { from: to, to: from } : { from, to });
}
