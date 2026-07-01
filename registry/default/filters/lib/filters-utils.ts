import { v4 as uuidv4 } from "uuid";

import type {
  FilterField,
  FilterFieldType,
  FilterOperator,
  FilterValue,
  NumberRange,
} from "./filters-types";

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

function op(id: string, valueless = false): FilterOperator {
  return { id, label: OPERATOR_LABELS[id] ?? id, valueless };
}

/** The default operator set for a field type, in display order. */
export function defaultOperatorsFor(type: FilterFieldType): FilterOperator[] {
  switch (type) {
    case "select":
      return [op("is"), op("is_not"), op("is_empty", true), op("is_not_empty", true)];
    case "multiselect":
      return [
        op("is_any_of"),
        op("is_not_any_of"),
        op("includes_all"),
        op("is_empty", true),
      ];
    case "text":
      return [
        op("contains"),
        op("not_contains"),
        op("starts_with"),
        op("ends_with"),
        op("is"),
        op("is_empty", true),
      ];
    case "number":
      return [op("eq"), op("neq"), op("gt"), op("lt"), op("between")];
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

/** Whether the given operator hides the value segment. */
export function isValuelessOperator(
  field: FilterField,
  operatorId: string,
): boolean {
  return (
    resolveOperators(field).find((operator) => operator.id === operatorId)
      ?.valueless ?? false
  );
}

/** A typed empty value for a fresh filter of `field` with `operatorId`. */
export function emptyValueFor(
  field: FilterField,
  operatorId: string,
): unknown {
  if (isValuelessOperator(field, operatorId)) return null;
  switch (field.type) {
    case "multiselect":
      return [] as string[];
    case "text":
      return "";
    case "number":
      return operatorId === "between"
        ? ({ min: null, max: null } satisfies NumberRange)
        : null;
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
  if (isValuelessOperator(field, operatorId)) return "none";
  if (field.type === "number") {
    return operatorId === "between" ? "range" : "scalar";
  }
  return field.type;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return uuidv4();
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
