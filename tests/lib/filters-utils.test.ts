import { describe, it, expect } from "vitest";
import type { FilterField } from "@/registry/default/filters/lib/filters-types";
import {
  asFilterValues,
  createFilter,
  describeFilter,
  formatFilterValue,
  isFilterComplete,
  operatorLabel,
  patchFilter,
  resolveOperators,
  scalarOperatorFor,
  withOption,
} from "@/registry/default/filters/lib/filters-utils";

const status: FilterField = {
  id: "status",
  label: "Status",
  type: "select",
  options: [
    { value: "todo", label: "Todo" },
    { value: "done", label: "Done" },
  ],
};

const labels: FilterField = {
  id: "labels",
  label: "Labels",
  type: "multiselect",
  maxSelections: 2,
  options: [
    { value: "bug", label: "Bug" },
    { value: "ui", label: "UI" },
    { value: "docs", label: "Docs" },
  ],
};

const title: FilterField = { id: "title", label: "Title", type: "text" };

const estimate: FilterField = {
  id: "estimate",
  label: "Estimate",
  type: "number",
};

describe("createFilter", () => {
  it("defaults to the first operator and a typed empty value", () => {
    expect(createFilter(status)).toMatchObject({
      field: "status",
      operator: "is",
      value: null,
    });
    expect(createFilter(labels).value).toEqual([]);
    expect(createFilter(title).value).toBe("");
  });

  it("seeds a range for a range operator", () => {
    expect(createFilter(estimate, { operator: "between" }).value).toEqual({
      min: null,
      max: null,
    });
  });

  it("keeps an explicit value, even a falsy one", () => {
    expect(createFilter(estimate, { value: 0 }).value).toBe(0);
  });

  it("gives each filter its own id", () => {
    expect(createFilter(status).id).not.toBe(createFilter(status).id);
  });
});

describe("patchFilter", () => {
  const filter = createFilter(estimate, { operator: "eq", value: 5 });

  it("keeps the value when the operator keeps its shape", () => {
    expect(patchFilter(estimate, filter, { operator: "gt" }).value).toBe(5);
  });

  it("reseeds the value when the operator changes shape", () => {
    expect(
      patchFilter(estimate, filter, { operator: "between" }).value,
    ).toEqual({ min: null, max: null });
  });

  it("prefers a value passed alongside the operator", () => {
    const next = patchFilter(estimate, filter, {
      operator: "between",
      value: { min: 1, max: 2 },
    });
    expect(next.value).toEqual({ min: 1, max: 2 });
  });
});

describe("asFilterValues", () => {
  it("keeps well-formed entries and drops the rest", () => {
    const parsed = asFilterValues([
      { id: "a", field: "status", operator: "is", value: "done" },
      { id: "b", field: "status" },
      null,
      "nope",
      { id: 1, field: "status", operator: "is" },
    ]);
    expect(parsed).toEqual([
      { id: "a", field: "status", operator: "is", value: "done" },
    ]);
  });

  it("returns an empty list for non-arrays", () => {
    expect(asFilterValues({ id: "a" })).toEqual([]);
    expect(asFilterValues(undefined)).toEqual([]);
  });
});

describe("withOption", () => {
  it("replaces the value for a single select", () => {
    expect(withOption(status, "todo", "done")).toBe("done");
  });

  it("appends once for a multiselect", () => {
    expect(withOption(labels, ["bug"], "ui")).toEqual(["bug", "ui"]);
    expect(withOption(labels, ["bug"], "bug")).toEqual(["bug"]);
  });

  it("stops at maxSelections", () => {
    expect(withOption(labels, ["bug", "ui"], "docs")).toEqual(["bug", "ui"]);
  });
});

describe("isFilterComplete", () => {
  it("is false until a value is set", () => {
    expect(isFilterComplete(status, createFilter(status))).toBe(false);
    expect(
      isFilterComplete(status, createFilter(status, { value: "done" })),
    ).toBe(true);
  });

  it("is true for a valueless operator", () => {
    expect(
      isFilterComplete(status, createFilter(status, { operator: "is_empty" })),
    ).toBe(true);
  });

  it("counts a half-open range", () => {
    const filter = createFilter(estimate, {
      operator: "between",
      value: { min: 3, max: null },
    });
    expect(isFilterComplete(estimate, filter)).toBe(true);
  });

  it("counts zero as a value", () => {
    expect(
      isFilterComplete(estimate, createFilter(estimate, { value: 0 })),
    ).toBe(true);
  });

  it("ignores option values the field doesn't have", () => {
    expect(
      isFilterComplete(status, createFilter(status, { value: "gone" })),
    ).toBe(false);
  });
});

describe("formatFilterValue", () => {
  it("uses option labels in option order", () => {
    const filter = createFilter(labels, { value: ["ui", "bug"] });
    expect(formatFilterValue(labels, filter)).toBe("Bug, UI");
  });

  it("describes open-ended ranges", () => {
    const range = (min: number | null, max: number | null) =>
      formatFilterValue(
        estimate,
        createFilter(estimate, { operator: "between", value: { min, max } }),
      );
    expect(range(1, 5)).toBe("1 to 5");
    expect(range(1, null)).toBe("from 1");
    expect(range(null, 5)).toBe("up to 5");
  });

  it("uses a custom field's formatValue", () => {
    const due: FilterField = {
      id: "due",
      label: "Due",
      type: "custom",
      renderValue: () => null,
      formatValue: (value) => `day ${String(value)}`,
    };
    expect(formatFilterValue(due, createFilter(due, { value: 3 }))).toBe(
      "day 3",
    );
  });
});

describe("describeFilter", () => {
  it("reads as a sentence", () => {
    const filter = createFilter(status, { operator: "is_not", value: "done" });
    expect(describeFilter(status, filter)).toBe("Status is not Done");
  });

  it("uses translated operator names", () => {
    const filter = createFilter(status, { operator: "is_not", value: "done" });
    expect(describeFilter(status, filter, { is_not: "n'est pas" })).toBe(
      "Status n'est pas Done",
    );
  });
});

describe("operators", () => {
  it("honors disabledOperators", () => {
    const field: FilterField = { ...title, disabledOperators: ["is_empty"] };
    expect(resolveOperators(field).map((o) => o.id)).not.toContain("is_empty");
  });

  it("finds the first single-value operator", () => {
    const field: FilterField = {
      ...estimate,
      operators: [
        { id: "between", label: "between", shape: "range" },
        { id: "gt", label: ">" },
      ],
    };
    expect(scalarOperatorFor(field)?.id).toBe("gt");
  });

  it("falls back to the operator's own label", () => {
    const [is] = resolveOperators(status);
    expect(operatorLabel(is)).toBe("is");
    expect(operatorLabel(is, { is: "est" })).toBe("est");
  });
});
