import { describe, it, expect } from "vitest";
import { useFuzzyFilter } from "@/registry/default/hooks/use-fuzzy-filter";

interface TestItem {
  id: number;
  name: string;
  category: string;
}

describe("useFuzzyFilter", () => {
  const items: TestItem[] = [
    { id: 1, name: "Apple", category: "Fruit" },
    { id: 2, name: "Banana", category: "Fruit" },
    { id: 3, name: "Carrot", category: "Vegetable" },
  ];

  describe("filter", () => {
    it("returns all items when query is empty", () => {
      const { filter } = useFuzzyFilter<TestItem>({ keys: ["name"] });
      const result = filter(items, "");
      expect(result).toHaveLength(3);
    });

    it("filters items by matching key", () => {
      const { filter } = useFuzzyFilter<TestItem>({ keys: ["name"] });
      const result = filter(items, "app");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Apple");
    });

    it("returns empty array when no matches", () => {
      const { filter } = useFuzzyFilter<TestItem>({ keys: ["name"] });
      const result = filter(items, "xyz");
      expect(result).toHaveLength(0);
    });

    it("searches multiple keys", () => {
      const { filter } = useFuzzyFilter<TestItem>({
        keys: ["name", "category"],
      });
      const result = filter(items, "fruit");
      expect(result).toHaveLength(2); // Apple and Banana
    });
  });

  describe("filterItem", () => {
    it("returns true when query is empty", () => {
      const { filterItem } = useFuzzyFilter<TestItem>({ keys: ["name"] });
      expect(filterItem(items[0], "")).toBe(true);
    });

    it("returns true when item matches", () => {
      const { filterItem } = useFuzzyFilter<TestItem>({ keys: ["name"] });
      expect(filterItem(items[0], "apple")).toBe(true);
    });

    it("returns false when item does not match", () => {
      const { filterItem } = useFuzzyFilter<TestItem>({ keys: ["name"] });
      expect(filterItem(items[0], "banana")).toBe(false);
    });
  });

  describe("threshold option", () => {
    it("respects starts-with threshold", () => {
      const { filter } = useFuzzyFilter<TestItem>({
        keys: ["name"],
        threshold: "starts-with",
      });
      // "app" starts-with matches "Apple"
      expect(filter(items, "app")).toHaveLength(1);
      // "pple" does not start with "Apple"
      expect(filter(items, "pple")).toHaveLength(0);
    });
  });
});
