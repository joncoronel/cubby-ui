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

/**
 * The value shape an operator expects: `"none"` hides the value segment
 * (`is empty`), `"range"` renders paired min/max inputs on number fields
 * (`between`), and `"scalar"` renders the field's normal single control.
 */
export type FilterOperatorShape = "none" | "scalar" | "range";

/** An operator shown in the middle segment of a pill (`is`, `contains`, ...). */
export interface FilterOperator {
  id: string;
  label: string;
  /** Value shape this operator expects. Defaults to `"scalar"`. */
  shape?: FilterOperatorShape;
  /** Sugar for `shape: "none"`, e.g. `is empty` / `is not empty`. */
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
  /** Maximum number of options that can be selected. */
  maxSelections?: number;
}

export interface TextFilterField extends FilterFieldBase {
  type: "text";
  placeholder?: string;
  /** Content shown before the input, e.g. `@` or an icon. */
  prefix?: React.ReactNode;
  /** Content shown after the input, e.g. a unit label. */
  suffix?: React.ReactNode;
}

export interface NumberFilterField extends FilterFieldBase {
  type: "number";
  placeholder?: string;
  step?: number;
  /** Content shown before the input, e.g. `$`. */
  prefix?: React.ReactNode;
  /** Content shown after the input, e.g. `%` or `hrs`. */
  suffix?: React.ReactNode;
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
  enterValue: string;
  value: string;
  min: string;
  max: string;
  /** Word used in the operator trigger's accessible name. */
  operator: string;
  /** Builds the accessible label for a pill's remove button. */
  removeFilter: (fieldLabel: string) => string;
}

export interface FiltersProviderProps {
  /** Field definitions the bar can filter on. */
  fields: FilterField[];
  /** Controlled list of active filters. */
  value?: FilterValue[];
  /** Initial filters in uncontrolled mode. */
  defaultValue?: FilterValue[];
  onValueChange?: (value: FilterValue[]) => void;
  size?: FilterSize;
  /** Allow the same field to be added more than once. Defaults to `false`. */
  allowDuplicateFields?: boolean;
  labels?: Partial<FiltersLabels>;
  children?: React.ReactNode;
}

export interface FiltersBarProps extends Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> {
  /** Key that opens the add-filter menu, forwarded to the default `FilterAddButton`. */
  shortcut?: string;
}

export interface FiltersProps
  extends Omit<FiltersProviderProps, "children">, FiltersBarProps {}

export interface FilterChipProps extends Omit<
  React.ComponentProps<"div">,
  "onChange"
> {
  filter: FilterValue;
  /** Field definition. Resolved from the `Filters` context when omitted. */
  field?: FilterField;
}
