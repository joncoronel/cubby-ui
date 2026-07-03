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
 * Per-size styling contract shared by every segment of a pill. Restyle here
 * rather than in the individual components.
 */
export const FILTER_SIZES: Record<
  FilterSize,
  {
    /** `Button` size for icon-only segments (the remove button). */
    iconButton: "icon_sm" | "icon" | "icon_lg";
    /** `Input` size for inline text inputs. */
    input: "sm" | "default";
    /** Height matching the `Button` size, for non-button segments. */
    height: string;
    /** Padding + text classes for the field-label segment. */
    fieldLabel: string;
  }
> = {
  sm: {
    iconButton: "icon_sm",
    input: "sm",
    height: "h-9 sm:h-8",
    fieldLabel: "px-2.5 text-xs",
  },
  default: {
    iconButton: "icon",
    input: "default",
    height: "h-10 sm:h-9",
    fieldLabel: "px-3",
  },
  lg: {
    iconButton: "icon_lg",
    input: "default",
    height: "h-11 sm:h-10",
    fieldLabel: "px-4",
  },
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

function isFilterValue(item: unknown): item is FilterValue {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as Partial<Record<keyof FilterValue, unknown>>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.field === "string" &&
    typeof candidate.operator === "string"
  );
}

/**
 * Coerces unknown JSON (e.g. a parsed URL param) into a `FilterValue` array,
 * dropping entries whose envelope (`id` / `field` / `operator`) is malformed.
 * `value` stays `unknown`; the per-field coercers above handle it downstream.
 */
export function asFilterValues(value: unknown): FilterValue[] {
  return Array.isArray(value) ? value.filter(isFilterValue) : [];
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
    default:
      return "";
  }
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
