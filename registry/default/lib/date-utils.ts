/**
 * Small local-time date helpers shared by the calendar, the date pickers, and
 * parse-date. Every date here is a local calendar day; times are dropped.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** The same calendar day at local midnight. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whether two dates fall on the same calendar day, ignoring the time. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calendar days from `a` to `b` (negative when `b` is earlier), ignoring the
 * time of day. Rounded, so a DST change inside the span doesn't skew it.
 */
export function daysBetween(a: Date, b: Date): number {
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS,
  );
}

/** `YYYY-MM-DD` in local time, the form `<input type="date">` submits. */
export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
