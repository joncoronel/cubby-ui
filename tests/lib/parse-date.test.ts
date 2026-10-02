import { describe, it, expect } from "vitest";
import { parseDate, parseDateRange } from "@/registry/default/lib/parse-date";

// Thursday, 1 October 2026.
const referenceDate = new Date(2026, 9, 1, 15, 30);
const us = { referenceDate, locale: "en-US" };
const uk = { referenceDate, locale: "en-GB" };

function ymd(date: Date | null): string | null {
  if (!date) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function range(input: string, options = us): [string, string] | null {
  const result = parseDateRange(input, options);
  return result ? [ymd(result.from)!, ymd(result.to)!] : null;
}

describe("parseDate", () => {
  it("returns local midnight", () => {
    const date = parseDate("today", us);
    expect(date?.getHours()).toBe(0);
    expect(date?.getMinutes()).toBe(0);
  });

  it.each([
    ["today", "2026-10-01"],
    ["Tomorrow", "2026-10-02"],
    ["tmrw", "2026-10-02"],
    ["yesterday", "2026-09-30"],
    ["in 3 days", "2026-10-04"],
    ["+2w", "2026-10-15"],
    ["3 weeks", "2026-10-22"],
    ["2 days ago", "2026-09-29"],
    ["-1d", "2026-09-30"],
    ["next week", "2026-10-08"],
    ["last month", "2026-09-01"],
    ["in 1 year", "2027-10-01"],
  ])("reads relative %j", (input, expected) => {
    expect(ymd(parseDate(input, us))).toBe(expected);
  });

  it("clamps month arithmetic to the end of a shorter month", () => {
    const jan31 = { ...us, referenceDate: new Date(2026, 0, 31) };
    expect(ymd(parseDate("next month", jan31))).toBe("2026-02-28");
  });

  it.each([
    ["thursday", "2026-10-01"],
    ["fri", "2026-10-02"],
    ["next thu", "2026-10-08"],
    ["last thursday", "2026-09-24"],
    ["monday", "2026-10-05"],
    ["last mon", "2026-09-28"],
  ])("reads weekday %j", (input, expected) => {
    expect(ymd(parseDate(input, us))).toBe(expected);
  });

  it.each([
    ["mar 14", "2026-03-14"],
    ["March 14, 2027", "2027-03-14"],
    ["14 march", "2026-03-14"],
    ["14th of March 2027", "2027-03-14"],
    ["Thu, Oct 1, 2026", "2026-10-01"],
    ["sept 3", "2026-09-03"],
    ["dec 25 '27", "2027-12-25"],
    ["march 2027", "2027-03-01"],
    ["14", "2026-10-14"],
  ])("reads word date %j", (input, expected) => {
    expect(ymd(parseDate(input, us))).toBe(expected);
  });

  it("reads numeric dates in the locale's order", () => {
    expect(ymd(parseDate("3/4/2026", us))).toBe("2026-03-04");
    expect(ymd(parseDate("3/4/2026", uk))).toBe("2026-04-03");
    expect(ymd(parseDate("14.03.26", uk))).toBe("2026-03-14");
    expect(ymd(parseDate("12/25", us))).toBe("2026-12-25");
  });

  it("reads year-first dates regardless of locale", () => {
    expect(ymd(parseDate("2026-03-14", uk))).toBe("2026-03-14");
    expect(ymd(parseDate("2026/3/4", us))).toBe("2026-03-04");
  });

  it("expands two-digit years to within 20 years ahead", () => {
    expect(ymd(parseDate("1/1/46", us))).toBe("2046-01-01");
    expect(ymd(parseDate("1/1/47", us))).toBe("1947-01-01");
  });

  it.each([
    "",
    "   ",
    "feb 30",
    "13/13/2026",
    "banana",
    "mar apr",
    "3 bananas",
  ])("rejects %j", (input) => {
    expect(parseDate(input, us)).toBeNull();
  });

  it("reads month names in the given locale", () => {
    expect(
      ymd(parseDate("14 mars 2027", { referenceDate, locale: "fr" })),
    ).toBe("2027-03-14");
  });
});

describe("parseDateRange", () => {
  it("reads two full dates", () => {
    expect(range("Oct 3, 2026 - Oct 12, 2026")).toEqual([
      "2026-10-03",
      "2026-10-12",
    ]);
  });

  it("reads its own compact format back", () => {
    expect(range("Oct 1 – 8, 2026")).toEqual(["2026-10-01", "2026-10-08"]);
    expect(range("Oct 28 – Nov 3, 2026")).toEqual(["2026-10-28", "2026-11-03"]);
  });

  it.each([
    ["mar 3 to 12", ["2026-03-03", "2026-03-12"]],
    ["today until friday", ["2026-10-01", "2026-10-02"]],
    ["today - 14", ["2026-10-01", "2026-10-14"]],
    ["2026-03-01 - 2026-03-05", ["2026-03-01", "2026-03-05"]],
  ])("reads %j", (input, expected) => {
    expect(range(input)).toEqual(expected);
  });

  it("crosses New Year when the years are inferred", () => {
    expect(range("Dec 28 – Jan 4")).toEqual(["2026-12-28", "2027-01-04"]);
    expect(range("Dec 28, 2026 – Jan 4")).toEqual(["2026-12-28", "2027-01-04"]);
    expect(range("Dec 28 – Jan 4, 2027")).toEqual(["2026-12-28", "2027-01-04"]);
  });

  it("flips a range written backwards", () => {
    expect(range("oct 12 - oct 3")).toEqual(["2026-10-03", "2026-10-12"]);
  });

  it("reads relative spans", () => {
    expect(range("last 7 days")).toEqual(["2026-09-25", "2026-10-01"]);
    expect(range("next 2 weeks")).toEqual(["2026-10-01", "2026-10-14"]);
  });

  it("reads a single date as a one-day range", () => {
    expect(range("tomorrow")).toEqual(["2026-10-02", "2026-10-02"]);
  });

  it.each(["", "oct 3 - banana", "a - b - c", "last 0 days"])(
    "rejects %j",
    (input) => {
      expect(parseDateRange(input, us)).toBeNull();
    },
  );
});
