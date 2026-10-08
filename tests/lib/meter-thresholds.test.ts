import { describe, it, expect } from "vitest";
import {
  readMeter,
  toPercent,
  type MeterReadingOptions,
  type MeterStatus,
} from "@/registry/default/meter/lib/meter-thresholds";

const base = { min: 0, max: 100 };

describe("readMeter status", () => {
  const cases: [string, MeterReadingOptions, MeterStatus | undefined][] = [
    ["no thresholds", { ...base, value: 50 }, undefined],

    // Lower is better: optimum below low
    [
      "lower: in low region",
      { ...base, value: 30, low: 60, high: 85, optimum: 0 },
      "optimum",
    ],
    [
      "lower: at low",
      { ...base, value: 60, low: 60, high: 85, optimum: 0 },
      "optimum",
    ],
    [
      "lower: between",
      { ...base, value: 70, low: 60, high: 85, optimum: 0 },
      "suboptimum",
    ],
    [
      "lower: at high",
      { ...base, value: 85, low: 60, high: 85, optimum: 0 },
      "suboptimum",
    ],
    [
      "lower: past high",
      { ...base, value: 86, low: 60, high: 85, optimum: 0 },
      "critical",
    ],

    // Higher is better: optimum above high
    [
      "higher: in high region",
      { ...base, value: 80, low: 20, high: 50, optimum: 100 },
      "optimum",
    ],
    [
      "higher: at high",
      { ...base, value: 50, low: 20, high: 50, optimum: 100 },
      "optimum",
    ],
    [
      "higher: between",
      { ...base, value: 30, low: 20, high: 50, optimum: 100 },
      "suboptimum",
    ],
    [
      "higher: at low",
      { ...base, value: 20, low: 20, high: 50, optimum: 100 },
      "suboptimum",
    ],
    [
      "higher: below low",
      { ...base, value: 19, low: 20, high: 50, optimum: 100 },
      "critical",
    ],

    // Middle is best: optimum between low and high
    [
      "middle: inside",
      { ...base, value: 46, low: 30, high: 60, optimum: 45 },
      "optimum",
    ],
    [
      "middle: at low",
      { ...base, value: 30, low: 30, high: 60, optimum: 45 },
      "optimum",
    ],
    [
      "middle: at high",
      { ...base, value: 60, low: 30, high: 60, optimum: 45 },
      "optimum",
    ],
    [
      "middle: below",
      { ...base, value: 10, low: 30, high: 60, optimum: 45 },
      "suboptimum",
    ],
    [
      "middle: above",
      { ...base, value: 90, low: 30, high: 60, optimum: 45 },
      "suboptimum",
    ],
    [
      "middle: optimum defaults to midpoint",
      { ...base, value: 90, low: 30, high: 60 },
      "suboptimum",
    ],

    // Clamping
    [
      "value above max clamps",
      { ...base, value: 150, low: 60, high: 85, optimum: 0 },
      "critical",
    ],
    [
      "value below min clamps",
      { ...base, value: -10, low: 20, high: 50, optimum: 100 },
      "critical",
    ],
    [
      "optimum above max clamps",
      { ...base, value: 90, low: 50, high: 100, optimum: 150 },
      "optimum",
    ],
    [
      "high below low is raised to low",
      { ...base, value: 60, low: 60, high: 40, optimum: 100 },
      "optimum",
    ],
    [
      "only high set",
      { ...base, value: 90, high: 80, optimum: 0 },
      "suboptimum",
    ],
  ];

  it.each(cases)("%s", (_, options, expected) => {
    expect(readMeter(options).status).toBe(expected);
  });
});

describe("readMeter notches", () => {
  it("marks each set threshold", () => {
    expect(readMeter({ ...base, value: 0, low: 25, high: 75 }).notches).toEqual(
      [25, 75],
    );
  });

  it("skips thresholds that aren't set", () => {
    expect(readMeter({ ...base, value: 0, high: 80 }).notches).toEqual([80]);
  });

  it("uses clamped bounds, so a high below low collapses onto low", () => {
    expect(
      readMeter({ ...base, value: 0, low: 60, high: 40, optimum: 100 }).notches,
    ).toEqual([60]);
  });

  it("scales to a custom range", () => {
    expect(
      readMeter({ value: 5, min: 2, max: 12, low: 4.5, high: 7 }).notches,
    ).toEqual([25, 50]);
  });
});

describe("readMeter targetRange", () => {
  it("spans low to high when the optimum sits between them", () => {
    expect(
      readMeter({ value: 6, min: 2, max: 14, low: 4, high: 7, optimum: 5.5 })
        .targetRange,
    ).toEqual({
      start: (2 / 12) * 100,
      end: (5 / 12) * 100,
    });
  });

  it("uses the midpoint when optimum is omitted", () => {
    expect(
      readMeter({ ...base, value: 50, low: 30, high: 60 }).targetRange,
    ).toEqual({ start: 30, end: 60 });
  });

  it("is absent when the optimum sits outside", () => {
    expect(
      readMeter({ ...base, value: 50, low: 60, high: 85, optimum: 0 })
        .targetRange,
    ).toBeUndefined();
  });

  it("follows the clamped optimum, matching status", () => {
    const reading = readMeter({
      ...base,
      value: 90,
      low: 50,
      high: 100,
      optimum: 150,
    });
    expect(reading.targetRange).toEqual({ start: 50, end: 100 });
    expect(reading.status).toBe("optimum");
  });

  it("needs both low and high", () => {
    expect(
      readMeter({ ...base, value: 50, low: 30 }).targetRange,
    ).toBeUndefined();
  });

  it("is absent when the bounds collapse", () => {
    expect(
      readMeter({ ...base, value: 50, low: 60, high: 40, optimum: 60 })
        .targetRange,
    ).toBeUndefined();
  });
});

describe("toPercent", () => {
  it("maps into 0 to 100 and clamps", () => {
    expect(toPercent(5, 0, 10)).toBe(50);
    expect(toPercent(-5, 0, 10)).toBe(0);
    expect(toPercent(20, 0, 10)).toBe(100);
  });

  it("returns 0 for an empty range", () => {
    expect(toPercent(5, 10, 10)).toBe(0);
  });
});
