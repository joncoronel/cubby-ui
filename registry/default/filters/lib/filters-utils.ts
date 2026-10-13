import { cn } from "@/lib/utils";
import { solidSurface } from "@/registry/default/lib/elevated";

import type {
  FilterField,
  FilterFieldType,
  FilterOperator,
  FilterOperatorShape,
  FilterSize,
  FilterValue,
  FilterVariant,
  NumberRange,
} from "./filters-types";

/** TextMorph duration for click-driven labels; snappier than the default 240ms. */
export const CLICK_MORPH_MS = 209;

/**
 * Shared segment classes. The inset is two 1px transparent borders, the
 * chip's and each segment's, so plates sit 2px from the edge and from each
 * other and snap alike at every display scale. The hover plate paints on
 * ::before inside the segment's border, so it can scale on press while the
 * label holds still. Box corners are the chip's minus its border; the
 * plate's are 1px less, so plate, gap, and focus ring are concentric.
 */
export const FILTER_SEGMENT = cn(
  "relative isolate inline-flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap border border-transparent bg-clip-padding rounded-[calc(var(--radius-lg)-var(--filter-border,1px))] px-(--seg-x) outline-0 outline-transparent outline-solid transition-[background-color,color,outline-color] duration-100 ease-out focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring/50",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[calc(var(--radius-lg)-var(--filter-border,1px)-1px)] before:content-[''] before:transition-[background-color,scale] before:duration-100 before:ease-out",
);

/**
 * Hover and press as in Button Group: the label color at 10% / 14%, and the
 * plate scales to 0.98. Menu triggers (aria-haspopup) skip the press and hold
 * the hover plate while open.
 */
export const FILTER_SEGMENT_INTERACTIVE =
  "cursor-pointer hover:before:bg-(--filter-highlight) active:not-aria-[haspopup]:before:bg-(--filter-press) active:not-aria-[haspopup]:before:scale-[0.98] data-popup-open:before:bg-(--filter-highlight) motion-reduce:active:before:scale-100";

/**
 * Shell classes per variant. Every chip has a 1px transparent border, the
 * outer half of the inset. Outline draws its line as an outline just outside,
 * the way elevated's shadow ring sits outside; elevated's inner rim is the
 * border itself. An incomplete filter dashes that line. `--filter-chip-bg`
 * lets stacked option icons ring in the fill.
 */
export const FILTER_VARIANTS: Record<FilterVariant, string> = {
  outline:
    "bg-card border-transparent outline outline-border data-incomplete:outline-dashed [--filter-chip-bg:var(--card)]",
  soft: "bg-secondary border-transparent data-incomplete:outline data-incomplete:outline-border data-incomplete:outline-dashed [--filter-chip-bg:var(--secondary)]",
  elevated: cn(
    solidSurface(3, 3),
    "shadow-(--surface-shadow-3) border-(--surface-rim-color) [--filter-chip-bg:var(--surface-3)]",
    // Incomplete: the drop shadow stays; a dashed outline takes the ring's place.
    "data-incomplete:border-transparent data-incomplete:shadow-[0_1px_1px_-0.5px_var(--surface-shadow-near),0_3px_3px_-1.5px_var(--surface-shadow-mid)] data-incomplete:outline data-incomplete:outline-border data-incomplete:outline-dashed",
  ),
};

/** Tints for segment hover and press, set on each shell. */
export const FILTER_TINTS =
  "[--filter-highlight:color-mix(in_oklab,var(--foreground)_10%,transparent)] [--filter-press:color-mix(in_oklab,var(--foreground)_14%,transparent)]";

/**
 * Per-size chip classes; heights match the `Button` ramp. `--seg-x` is segment
 * side padding; `--seg-icon-x` squares an icon-only segment:
 * (height - 2*(1px chip border + 1px segment border) - 16px icon) / 2.
 */
export const FILTER_SIZES: Record<FilterSize, string> = {
  sm: "h-9 sm:h-8 [--seg-icon-x:8px] sm:[--seg-icon-x:6px] text-sm [--seg-x:0.5rem] [&_[data-slot=filter-chip-field]_svg]:size-3.5",
  default:
    "h-10 sm:h-9 [--seg-icon-x:10px] sm:[--seg-icon-x:8px] text-sm [--seg-x:0.625rem] [&_[data-slot=filter-chip-field]_svg]:size-3.5",
  lg: "h-11 sm:h-10 [--seg-icon-x:12px] sm:[--seg-icon-x:10px] text-base [--seg-x:0.75rem] [&_[data-slot=filter-chip-field]_svg]:size-4",
};

// `FilterValue.value` is `unknown` and may come from untrusted input (URL
// state, `JSON.parse`), so reads go through these coercers, never a cast.

export function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function asNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function asNumberRange(value: unknown): NumberRange {
  if (typeof value === "object" && value !== null) {
    const candidate = value as Partial<Record<"min" | "max", unknown>>;
    return {
      min: asNumberOrNull(candidate.min),
      max: asNumberOrNull(candidate.max),
    };
  }
  return { min: null, max: null };
}

/** Coerces unknown JSON into `FilterValue[]`, dropping entries without string `id`/`field`/`operator`. */
export function asFilterValues(value: unknown): FilterValue[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.field === "string" &&
        typeof item.operator === "string",
    )
    .map((item) => ({
      id: item.id as string,
      field: item.field as string,
      operator: item.operator as string,
      value: item.value,
    }));
}

const OPERATOR_LABELS: Record<string, string> = {
  is: "is",
  is_not: "is not",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  is_any_of: "is any of",
  is_not_any_of: "is not any of",
  includes_all: "includes all",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  eq: "=",
  neq: "≠",
  gt: ">",
  lt: "<",
  between: "between",
};

function op(id: string, shape: FilterOperatorShape = "scalar"): FilterOperator {
  return { id, label: OPERATOR_LABELS[id] ?? id, shape };
}

/** The default operator set for a field type, in display order. */
export function defaultOperatorsFor(type: FilterFieldType): FilterOperator[] {
  switch (type) {
    case "select":
      return [
        op("is"),
        op("is_not"),
        op("is_empty", "none"),
        op("is_not_empty", "none"),
      ];
    case "multiselect":
      return [
        op("is_any_of"),
        op("is_not_any_of"),
        op("includes_all"),
        op("is_empty", "none"),
      ];
    case "text":
      return [
        op("contains"),
        op("not_contains"),
        op("starts_with"),
        op("ends_with"),
        op("is"),
        op("is_empty", "none"),
      ];
    case "number":
      return [op("eq"), op("neq"), op("gt"), op("lt"), op("between", "range")];
    case "custom":
    default:
      return [op("is")];
  }
}

/** Resolves the operators available for a field, honoring overrides. */
export function resolveOperators(field: FilterField): FilterOperator[] {
  const base = field.operators ?? defaultOperatorsFor(field.type);
  if (!field.disabledOperators?.length) return base;
  const disabled = new Set(field.disabledOperators);
  return base.filter((operator) => !disabled.has(operator.id));
}

/** The value shape an operator declares (`valueless` is sugar for `"none"`). */
export function operatorShape(operator: FilterOperator): FilterOperatorShape {
  return operator.shape ?? (operator.valueless ? "none" : "scalar");
}

/** Resolves the value shape for a field's operator by id. */
export function operatorShapeFor(
  field: FilterField,
  operatorId: string,
): FilterOperatorShape {
  const operator = resolveOperators(field).find((o) => o.id === operatorId);
  return operator ? operatorShape(operator) : "scalar";
}

/** A typed empty value for a fresh filter of `field` with `operatorId`. */
export function emptyValueFor(field: FilterField, operatorId: string): unknown {
  const shape = operatorShapeFor(field, operatorId);
  if (shape === "none") return null;
  if (shape === "range") {
    return { min: null, max: null } satisfies NumberRange;
  }
  if (field.type === "multiselect") return [] as string[];
  if (field.type === "text") return "";
  if (field.type === "custom") return field.defaultValue ?? null;
  return null;
}

function generateId(): string {
  // `crypto.randomUUID` is absent in non-secure contexts (plain-HTTP LAN dev);
  // ids only need list-key uniqueness.
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Creates a `FilterValue`, defaulting to the field's first operator and a typed empty value. */
export function createFilter(
  field: FilterField,
  partial?: Partial<Omit<FilterValue, "field">>,
): FilterValue {
  const operators = resolveOperators(field);
  const operator = partial?.operator ?? operators[0]?.id ?? "is";
  return {
    id: partial?.id ?? generateId(),
    field: field.id,
    operator,
    value:
      partial && "value" in partial
        ? partial.value
        : emptyValueFor(field, operator),
  };
}

/** Applies a patch; an operator change to a different value shape reseeds the value. */
export function patchFilter(
  field: FilterField | undefined,
  filter: FilterValue,
  patch: Partial<Omit<FilterValue, "id">>,
): FilterValue {
  const next: FilterValue = { ...filter, ...patch };
  const operatorChanged =
    patch.operator !== undefined && patch.operator !== filter.operator;
  if (
    operatorChanged &&
    !("value" in patch) &&
    field &&
    operatorShapeFor(field, filter.operator) !==
      operatorShapeFor(field, next.operator)
  ) {
    next.value = emptyValueFor(field, next.operator);
  }
  return next;
}

/** Human-readable value, shared by the visible controls and the aria summary so they match. */
export function formatFilterValue(
  field: FilterField,
  filter: FilterValue,
): string {
  const shape = operatorShapeFor(field, filter.operator);
  if (shape === "none") return "";
  if (shape === "range") {
    const { min, max } = asNumberRange(filter.value);
    if (min === null && max === null) return "";
    if (min === null) return `up to ${max}`;
    if (max === null) return `from ${min}`;
    return `${min} to ${max}`;
  }
  switch (field.type) {
    case "select":
      return (
        field.options.find((option) => option.value === filter.value)?.label ??
        ""
      );
    case "multiselect": {
      const values = asStringArray(filter.value);
      return field.options
        .filter((option) => values.includes(option.value))
        .map((option) => option.label)
        .join(", ");
    }
    case "text":
      return asString(filter.value);
    case "number": {
      const numeric = asNumberOrNull(filter.value);
      return numeric === null ? "" : String(numeric);
    }
    case "custom": {
      if (field.formatValue) return field.formatValue(filter.value);
      const value = filter.value;
      return typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
        ? String(value)
        : "";
    }
    default:
      return "";
  }
}

/** The field's first single-value operator, so a value picked in the add menu has somewhere to go. */
export function scalarOperatorFor(
  field: FilterField,
): FilterOperator | undefined {
  return resolveOperators(field).find(
    (operator) => operatorShape(operator) === "scalar",
  );
}

/** Folds a picked option into the value: appended (once) for multiselect, else replaces it. */
export function withOption(
  field: FilterField,
  current: unknown,
  optionValue: string,
): unknown {
  if (field.type !== "multiselect") return optionValue;
  const values = asStringArray(current);
  if (values.includes(optionValue)) return values;
  if (field.maxSelections != null && values.length >= field.maxSelections) {
    return values;
  }
  return [...values, optionValue];
}

/** Display name: the `labels.operators` translation, else the operator's own `label`. */
export function operatorLabel(
  operator: FilterOperator,
  names?: Partial<Record<string, string>>,
): string {
  return names?.[operator.id] ?? operator.label;
}

/** Whether a filter narrows anything yet (valueless operator, or a value set). */
export function isFilterComplete(
  field: FilterField,
  filter: FilterValue,
): boolean {
  return (
    operatorShapeFor(field, filter.operator) === "none" ||
    formatFilterValue(field, filter) !== ""
  );
}

/** Plain-language summary for screen readers; `operatorNames` is `labels.operators`. */
export function describeFilter(
  field: FilterField,
  filter: FilterValue,
  operatorNames?: Partial<Record<string, string>>,
): string {
  const operator = resolveOperators(field).find(
    (candidate) => candidate.id === filter.operator,
  );
  const operatorText = operator
    ? operatorLabel(operator, operatorNames)
    : filter.operator;
  const summary = formatFilterValue(field, filter);
  return summary
    ? `${field.label} ${operatorText} ${summary}`
    : `${field.label} ${operatorText}`;
}
