import { describe, it, expect } from "vitest";
import {
  daysBetween,
  isSameDay,
  startOfDay,
  toISODate,
} from "@/registry/default/lib/date-utils";

describe("startOfDay", () => {
  it("drops the time of day", () => {
    const day = startOfDay(new Date(2026, 9, 2, 17, 45, 12));
    expect([day.getHours(), day.getMinutes(), day.getDate()]).toEqual([
      0, 0, 2,
    ]);
  });
});

describe("isSameDay", () => {
  it("ignores the time of day", () => {
    expect(isSameDay(new Date(2026, 9, 2, 1), new Date(2026, 9, 2, 23))).toBe(
      true,
    );
    expect(isSameDay(new Date(2026, 9, 2), new Date(2026, 9, 3))).toBe(false);
  });
});

describe("daysBetween", () => {
  it("counts calendar days in either direction", () => {
    expect(daysBetween(new Date(2026, 9, 1), new Date(2026, 9, 11))).toBe(10);
    expect(daysBetween(new Date(2026, 9, 11), new Date(2026, 9, 1))).toBe(-10);
  });

  it("ignores the time of day", () => {
    expect(daysBetween(new Date(2026, 9, 1, 23), new Date(2026, 9, 2, 1))).toBe(
      1,
    );
  });

  it("is not skewed by a DST change in the span", () => {
    expect(daysBetween(new Date(2026, 2, 1), new Date(2026, 3, 1))).toBe(31);
  });
});

describe("toISODate", () => {
  it("pads month and day", () => {
    expect(toISODate(new Date(2026, 2, 4))).toBe("2026-03-04");
  });
});
