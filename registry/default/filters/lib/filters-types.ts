import type * as React from "react";

/** Size of the filter bar and its pills. */
export type FilterSize = "sm" | "default" | "lg";

/** Built-in field types. `custom` renders its own value control. */
export type FilterFieldType =
  | "select"
  | "multiselect"
  | "text"
  | "number"
  | "custom";

/** A selectable option for `select` / `multiselect` fields. */
export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

/** An operator shown in the middle segment of a pill (`is`, `contains`, ...). */
export interface FilterOperator {
  id: string;
  label: string;
  /** When true the value segment is hidden, e.g. `is empty` / `is not empty`. */
  valueless?: boolean;
}

interface FilterFieldBase {
  /** Stable key stored on each filter as `FilterValue.field`. */
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Override the default operators for this field's type. */
  operators?: FilterOperator[];
  /** Hide specific default operators by id. */
  disabledOperators?: string[];
}

export interface SelectFilterField extends FilterFieldBase {
  type: "select";
  options: FilterOption[];
  placeholder?: string;
}

export interface MultiSelectFilterField extends FilterFieldBase {
  type: "multiselect";
  options: FilterOption[];
  placeholder?: string;
}

export interface TextFilterField extends FilterFieldBase {
  type: "text";
  placeholder?: string;
}

export interface NumberFilterField extends FilterFieldBase {
  type: "number";
  placeholder?: string;
  step?: number;
}

export interface CustomFilterField extends FilterFieldBase {
  type: "custom";
  /** Renders the value segment and reports changes back to the filter. */
  renderValue: (props: FilterValueControlProps) => React.ReactNode;
  /** Seed value for a fresh filter of this field. */
  defaultValue?: unknown;
}

export type FilterField =
  | SelectFilterField
  | MultiSelectFilterField
  | TextFilterField
  | NumberFilterField
  | CustomFilterField;

/** Props passed to a `custom` field's `renderValue`. */
export interface FilterValueControlProps {
  value: unknown;
  operator: string;
  onValueChange: (value: unknown) => void;
  size: FilterSize;
  field: FilterField;
}

/** Value shape for a `number` field when the operator is `between`. */
export interface NumberRange {
  min: number | null;
  max: number | null;
}

/**
 * A single active filter. `value` is typed by the field:
 * `select → string | null`, `multiselect → string[]`, `text → string`,
 * `number → number | null | NumberRange`, `custom → unknown`.
 */
export interface FilterValue {
  id: string;
  field: string;
  operator: string;
  value: unknown;
}

/** Copy overrides for the bar's chrome. */
export interface FiltersLabels {
  add: string;
  clear: string;
  searchFields: string;
  searchValues: string;
  noFields: string;
  noResults: string;
  selectValue: string;
}

export interface FiltersProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  /** Field definitions the bar can filter on. */
  fields: FilterField[];
  /** Controlled list of active filters. */
  value?: FilterValue[];
  /** Initial filters in uncontrolled mode. */
  defaultValue?: FilterValue[];
  onValueChange?: (value: FilterValue[]) => void;
  size?: FilterSize;
  addLabel?: React.ReactNode;
  /** Show a "Clear all" button once filters exist. Defaults to `true`. */
  showClear?: boolean;
  /** Show a count badge of active filters. Defaults to `false`. */
  showActiveCount?: boolean;
  /** Allow the same field to be added more than once. Defaults to `false`. */
  allowDuplicateFields?: boolean;
  labels?: Partial<FiltersLabels>;
}

export interface FilterChipProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  filter: FilterValue;
  field: FilterField;
}
