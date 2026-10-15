import { describe, it, expect } from "vitest";
import {
  POPUP_SEARCH_BAND,
  POPUP_SEARCH_CLEAR,
  POPUP_SEARCH_FIELD,
  POPUP_SEARCH_INPUT,
  POPUP_SEARCH_MENU_LIST,
} from "@/registry/default/lib/popup-search";

const classes = (value: string): string[] => value.split(/\s+/);

describe("popup search classes", () => {
  it("outlines the field without filling it, so it never reads as a highlighted item", () => {
    expect(classes(POPUP_SEARCH_FIELD)).toContain("inset-ring");
    expect(classes(POPUP_SEARCH_FIELD).some((c) => c.startsWith("bg-"))).toBe(
      false,
    );
  });

  it("matches the item radius and label inset", () => {
    expect(classes(POPUP_SEARCH_FIELD)).toEqual(
      expect.arrayContaining(["rounded-md", "px-2.5"]),
    );
  });

  it("draws no focus ring on the always-focused field", () => {
    expect(POPUP_SEARCH_FIELD).not.toMatch(/focus|outline-/);
    expect(classes(POPUP_SEARCH_INPUT)).toContain("outline-none");
  });

  it("keeps 16px text below md so iOS Safari doesn't zoom on focus", () => {
    expect(classes(POPUP_SEARCH_INPUT)).toEqual(
      expect.arrayContaining(["text-base", "md:text-sm"]),
    );
  });

  it("gives the clear button a 40px hit area around its 24px face", () => {
    expect(classes(POPUP_SEARCH_CLEAR)).toEqual(
      expect.arrayContaining(["size-6", "relative", "after:-inset-2"]),
    );
  });

  it("pads the band to the 4px row gutter on the sides and top", () => {
    expect(classes(POPUP_SEARCH_BAND)).toEqual(
      expect.arrayContaining(["px-1", "pt-1", "bg-(--popup-surface)"]),
    );
  });

  it("caps a menu's list to the space left under the field", () => {
    expect(POPUP_SEARCH_MENU_LIST).toContain(
      "calc(var(--available-height)-2.75rem)",
    );
  });
});
