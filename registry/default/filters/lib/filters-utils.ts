import type {
  FilterField,
  FilterFieldType,
  FilterOperator,
  FilterOperatorShape,
  FilterSize,
  FilterValue,
  NumberRange,
} from "./filters-types";

/**
 * TextMorph clock for labels that answer a click (operator, value, count):
 * the docs' click-feedback duration, shorter than the mode's own 240ms.
 */
export const CLICK_MORPH_MS = 209;

/**
 * Classes shared by every segment of a chip. The radius is the chip's
 * (`rounded-lg`) minus its 1px border and 2px inset, so hover plates sit
 * concentric with the chip's edge.
 */
export const FILTER_SEGMENT =
  "inline-flex h-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-lg)-3px)] px-(--seg-x) outline-0 outline-transparent outline-solid transition-[background-color,color,outline-color] duration-100 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring/50";

/** Hover, press and open paint for the clickable segments. */
export const FILTER_SEGMENT_INTERACTIVE =
  "cursor-pointer hover:bg-surface-hover active:bg-surface-active data-popup-open:bg-surface-hover";

/**
 * Per-size chip classes. `--seg-icon-x` is the side padding that makes an
 * icon-only segment square: (inner height - 16px icon) / 2, where the inner
 * height is the chip's less its 1px border and 2px inset on each side. Heights match the `Button` ramp so chips line up with
 * the add and clear buttons. Segments read `--seg-x` for their side padding;
 * their radius is the chip's minus its 1px border and 2px inset, so the hover
 * plates stay concentric with the chip. Restyle here rather than per segment.
 */
export const FILTER_SIZES: Record<FilterSize, string> = {
  sm: "h-9 sm:h-8 [--seg-icon-x:7px] sm:[--seg-icon-x:5px] text-sm [--seg-x:0.5rem] [&_[data-slot=filter-chip-field]_svg]:size-3.5",
  default:
    "h-10 sm:h-9 [--seg-icon-x:9px] sm:[--seg-icon-x:7px] text-sm [--seg-x:0.625rem] [&_[data-slot=filter-chip-field]_svg]:size-3.5",
  lg: "h-11 sm:h-10 [--seg-icon-x:11px] sm:[--seg-icon-x:9px] text-base [--seg-x:0.75rem] [&_[data-slot=filter-chip-field]_svg]:size-4",
};

// ----- Value coercers ---------------------------------------------------
// `FilterValue.value` is `unknown` (it may arrive from URL state or other
// untrusted sources, e.g. `JSON.parse`), so every read goes through a coercer
// that rebuilds the expected shape instead of trusting a cast.

/** Coerces an unknown filter value to a string (`""` when absent). */
export function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Coerces an unknown filter value to a string array. */
export function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/** Coerces an unknown filter value to a finite number or `null`. */
export function asNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Rebuilds a `NumberRange`, coercing each bound independently. */
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

/**
 * Coerces unknown JSON (e.g. a parsed URL param) into a `FilterValue` array,
 * dropping entries whose envelope (`id` / `field` / `operator`) is malformed.
 * `value` stays `unknown`; the per-field coercers above handle it downstream.
 */
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

/** Default English labels for the built-in operators. */
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

/** Whether the given operator hides the value segment. */
export function isValuelessOperator(
  field: FilterField,
  operatorId: string,
): boolean {
  return operatorShapeFor(field, operatorId) === "none";
}

/** A typed empty value for a fresh filter of `field` with `operatorId`. */
export function emptyValueFor(field: FilterField, operatorId: string): unknown {
  const shape = operatorShapeFor(field, operatorId);
  if (shape === "none") return null;
  if (shape === "range") {
    return { min: null, max: null } satisfies NumberRange;
  }
  switch (field.type) {
    case "multiselect":
      return [] as string[];
    case "text":
      return "";
    case "number":
      return null;
    case "custom":
      return field.defaultValue ?? null;
    case "select":
    default:
      return null;
  }
}

/**
 * Classifies the value shape for an operator so a shape change (e.g. `eq` to
 * `between`, or entering a valueless operator) can trigger a value reset.
 */
export function valueShape(field: FilterField, operatorId: string): string {
  const shape = operatorShapeFor(field, operatorId);
  if (shape === "none") return "none";
  if (shape === "range") return "range";
  return field.type;
}

function generateId(): string {
  // Filter ids only need list-key uniqueness. `crypto.randomUUID` is absent
  // in non-secure contexts (plain-HTTP LAN dev), hence the cheap fallback.
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Creates a `FilterValue` with a stable id. The operator defaults to the
 * field's first resolved operator and the value to a typed empty seed.
 */
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

/**
 * Applies a patch to a filter. When only the operator changes and the new
 * operator expects a different value shape (e.g. `eq` to `between`, or into a
 * valueless operator), the value is reseeded to a typed empty.
 */
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
    valueShape(field, filter.operator) !== valueShape(field, next.operator)
  ) {
    next.value = emptyValueFor(field, next.operator);
  }
  return next;
}

/**
 * Formats a filter's value as a human-readable string. Shared by the visible
 * value controls and the aria summary so the two never diverge.
 */
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

/**
 * The operator a filter added from the menu starts on: the field's first
 * operator that takes a single value, so a picked or typed value always has
 * somewhere to go. `undefined` when the field has none (the menu then adds
 * the filter straight away with its defaults).
 */
export function scalarOperatorFor(
  field: FilterField,
): FilterOperator | undefined {
  return resolveOperators(field).find(
    (operator) => operatorShape(operator) === "scalar",
  );
}

/**
 * Folds a picked option into the field's value: a multiselect gains it (once),
 * anything else is replaced by it. Used when a value is chosen straight from
 * the add menu's search for a field that already has a filter.
 */
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

/** Builds a plain-language summary of a filter, e.g. for screen readers. */
export function describeFilter(
  field: FilterField,
  filter: FilterValue,
): string {
  const operatorLabel =
    resolveOperators(field).find((operator) => operator.id === filter.operator)
      ?.label ?? filter.operator;
  const summary = formatFilterValue(field, filter);
  return summary
    ? `${field.label} ${operatorLabel} ${summary}`
    : `${field.label} ${operatorLabel}`;
}
