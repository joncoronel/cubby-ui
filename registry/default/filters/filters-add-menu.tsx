"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/default/combobox/combobox";
import { Kbd } from "@/registry/default/kbd/kbd";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";
import {
  TransitionPanel,
  TransitionPanelView,
} from "@/registry/default/transition-panel/transition-panel";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { useFiltersActions, useFiltersState } from "./filters-context";
import { revealInScroller } from "./lib/flow-presence";
import {
  asStringArray,
  createFilter,
  operatorLabel,
  FILTER_SEGMENT,
  FILTER_SEGMENT_INTERACTIVE,
  operatorShapeFor,
  scalarOperatorFor,
  withOption,
} from "./lib/filters-utils";
import type {
  FilterField,
  FilterOption,
  MultiSelectFilterField,
  NumberFilterField,
  SelectFilterField,
  TextFilterField,
} from "./lib/filters-types";

type OptionsField = SelectFilterField | MultiSelectFilterField;

type AddMenuItem =
  | { kind: "field"; key: string; field: FilterField }
  | { kind: "option"; key: string; field: OptionsField; option: FilterOption };

interface AddMenuGroup {
  value: "fields" | "values";
  label: string;
  items: AddMenuItem[];
}

function FieldIcon({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "text-muted-foreground flex shrink-0 items-center [&_svg]:size-3.5",
        className,
      )}
    >
      {children}
    </span>
  );
}

function OptionContent({ option }: { option: FilterOption }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {option.icon}
      <span className="truncate">{option.label}</span>
    </span>
  );
}

function hasValueStep(field: FilterField): boolean {
  return field.type !== "custom" && scalarOperatorFor(field) !== undefined;
}

const STEP_ROW =
  "h-11 gap-2 rounded-none border-0 border-b sm:h-11 bg-transparent px-3 outline-0 focus-within:outline-0 focus-within:outline-offset-0 dark:bg-transparent";

// Lists shrink first, so a menu squeezed against the viewport edge keeps its
// search row and footer visible. `--available-height` comes from the positioner.
const LIST_HEIGHT = "max-h-[min(18rem,calc(var(--available-height)-2.75rem))]";
const LIST_WITH_FOOTER_HEIGHT =
  "max-h-[min(16rem,calc(var(--available-height)-5.25rem))]";

function SearchIcon() {
  return (
    <HugeiconsIcon
      icon={Search01Icon}
      strokeWidth={2}
      className="text-muted-foreground size-4"
    />
  );
}

/** The drilled-in field at the start of the step's input; clicking it goes back. */
function ScopeToken({
  field,
  onBack,
}: {
  field: FilterField;
  onBack: () => void;
}) {
  const { labels } = useFiltersActions();
  return (
    <button
      type="button"
      data-slot="filter-add-scope"
      aria-label={`${labels.back}: ${field.label}`}
      onClick={onBack}
      className="bg-surface-hover hover:bg-surface-active text-foreground focus-visible:outline-ring/50 -ms-1 inline-flex h-6 max-w-32 shrink-0 cursor-pointer items-center gap-1 rounded-md ps-0.5 pe-2 text-xs font-medium outline-0 transition-colors duration-100 outline-solid focus-visible:outline-2"
    >
      <HugeiconsIcon
        icon={ArrowLeft01Icon}
        strokeWidth={2}
        className="text-muted-foreground size-3.5 shrink-0 rtl:rotate-180"
      />
      <FieldIcon className="[&_svg]:size-3">{field.icon}</FieldIcon>
      <span className="truncate">{field.label}</span>
    </button>
  );
}

function backOnEmptyBackspace(
  event: React.KeyboardEvent<HTMLInputElement>,
  onBack: () => void,
) {
  if (event.key !== "Backspace" || event.currentTarget.value !== "") return;
  event.preventDefault();
  onBack();
}

interface StepProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Closes the menu, optionally handing focus to a newly added filter. */
  onDone: (focusFilterId?: string) => void;
}

function FieldStep({
  inputRef,
  onDone,
  onDrill,
  findChip,
}: StepProps & {
  onDrill: (fieldId: string) => void;
  findChip: (filterId: string) => HTMLElement | null;
}) {
  const {
    fields,
    labels,
    usedFieldIds,
    allowDuplicateFields,
    addFilter,
    updateFilter,
    getFilters,
  } = useFiltersActions();
  // Filters are read via `getFilters`, not subscribed: the menu stays mounted
  // while closed and would otherwise re-render on every chip keystroke.
  const [query, setQuery] = React.useState("");

  const fieldItems = React.useMemo<AddMenuItem[]>(
    () =>
      fields.map((field) => ({ kind: "field", key: `f:${field.id}`, field })),
    [fields],
  );
  const optionItems = React.useMemo<AddMenuItem[]>(
    () =>
      fields.flatMap((field) =>
        (field.type === "select" || field.type === "multiselect") &&
        scalarOperatorFor(field)
          ? field.options.map((option) => ({
              kind: "option" as const,
              key: `o:${field.id}:${option.value}`,
              field,
              option,
            }))
          : [],
      ),
    [fields],
  );
  // Values join the list only while searching.
  const searching = query.trim() !== "";
  const groups = React.useMemo<AddMenuGroup[]>(
    () =>
      searching
        ? [
            { value: "fields", label: labels.fields, items: fieldItems },
            { value: "values", label: labels.values, items: optionItems },
          ]
        : [{ value: "fields", label: labels.fields, items: fieldItems }],
    [searching, labels.fields, labels.values, fieldItems, optionItems],
  );

  const pickField = (field: FilterField) => {
    if (hasValueStep(field)) {
      onDrill(field.id);
      return;
    }
    const filter = createFilter(field);
    addFilter(filter);
    onDone(filter.id);
  };

  const pickOption = (field: OptionsField, option: FilterOption) => {
    const scalar = scalarOperatorFor(field);
    if (!scalar) return;
    // Without duplicates, a searched value joins the field's existing filter.
    const existing = allowDuplicateFields
      ? undefined
      : getFilters().find((filter) => filter.field === field.id);
    if (existing) {
      const valueless = operatorShapeFor(field, existing.operator) === "none";
      updateFilter(existing.id, {
        ...(valueless && { operator: scalar.id }),
        value: withOption(
          field,
          valueless ? null : existing.value,
          option.value,
        ),
      });
      requestAnimationFrame(() => {
        const chip = findChip(existing.id);
        if (chip) revealInScroller(chip);
      });
    } else {
      addFilter(
        createFilter(field, {
          operator: scalar.id,
          value: field.type === "multiselect" ? [option.value] : option.value,
        }),
      );
    }
    onDone();
  };

  return (
    <Combobox<AddMenuItem, false>
      inline
      open
      autoHighlight
      items={groups}
      value={null}
      inputValue={query}
      onInputValueChange={setQuery}
      onValueChange={(item) => {
        if (!item) return;
        if (item.kind === "field") pickField(item.field);
        else pickOption(item.field, item.option);
      }}
      itemToStringLabel={(item) =>
        item.kind === "field" ? item.field.label : item.option.label
      }
      isItemEqualToValue={(a, b) => a.key === b.key}
    >
      {/* Flex column so the list's scroll area can resolve its height. */}
      <div className="flex flex-col">
        <ComboboxInput
          ref={inputRef}
          showTrigger={false}
          showClear={false}
          placeholder={labels.searchFields}
          start={<SearchIcon />}
          className={STEP_ROW}
        />
        <ComboboxEmpty>{labels.noFields}</ComboboxEmpty>
        <ComboboxList className={LIST_HEIGHT}>
          {(group: AddMenuGroup) => (
            <ComboboxGroup
              key={group.value}
              items={group.items}
              className="py-1 not-last:border-b"
            >
              {searching && (
                <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
              )}
              <ComboboxCollection>
                {(item: AddMenuItem) =>
                  item.kind === "field" ? (
                    <ComboboxItem
                      key={item.key}
                      value={item}
                      disabled={
                        !allowDuplicateFields && usedFieldIds.has(item.field.id)
                      }
                      className="my-0! grid-cols-[minmax(0,1fr)]"
                    >
                      <span className="flex w-full items-center gap-2.5">
                        <FieldIcon>{item.field.icon}</FieldIcon>
                        <span className="truncate">{item.field.label}</span>
                        {hasValueStep(item.field) && (
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            strokeWidth={2}
                            className="text-muted-foreground ms-auto size-3.5 shrink-0 rtl:rotate-180"
                          />
                        )}
                      </span>
                    </ComboboxItem>
                  ) : (
                    <ComboboxItem
                      key={item.key}
                      value={item}
                      className="my-0! grid-cols-[minmax(0,1fr)]"
                    >
                      <span className="flex w-full items-center gap-2.5">
                        <OptionContent option={item.option} />
                        <span className="text-muted-foreground ms-auto shrink-0 text-xs">
                          {item.field.label}
                        </span>
                      </span>
                    </ComboboxItem>
                  )
                }
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </div>
    </Combobox>
  );
}

interface ValueStepProps<F extends FilterField> extends StepProps {
  field: F;
  onBack: () => void;
}

function SelectStep({
  field,
  inputRef,
  onBack,
  onDone,
}: ValueStepProps<SelectFilterField>) {
  const { labels, addFilter } = useFiltersActions();
  return (
    <Combobox<FilterOption, false>
      inline
      open
      autoHighlight
      items={field.options}
      value={null}
      onValueChange={(option) => {
        const scalar = scalarOperatorFor(field);
        if (!option || !scalar) return;
        addFilter(
          createFilter(field, { operator: scalar.id, value: option.value }),
        );
        onDone();
      }}
      itemToStringLabel={(option) => option.label}
    >
      <div className="flex flex-col">
        <ComboboxInput
          ref={inputRef}
          showTrigger={false}
          showClear={false}
          placeholder={field.placeholder ?? labels.searchValues}
          start={<ScopeToken field={field} onBack={onBack} />}
          className={STEP_ROW}
          onKeyDown={(event) => backOnEmptyBackspace(event, onBack)}
        />
        <ComboboxEmpty>{labels.noResults}</ComboboxEmpty>
        <ComboboxList className={cn(LIST_HEIGHT, "py-1")}>
          {(option: FilterOption) => (
            <ComboboxItem key={option.value} value={option} className="my-0!">
              <OptionContent option={option} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </div>
    </Combobox>
  );
}

// The first pick adds the filter and later picks edit it live; clearing every
// pick removes it again.
function MultiSelectStep({
  field,
  inputRef,
  onBack,
  onDone,
}: ValueStepProps<MultiSelectFilterField>) {
  const { labels, addFilter, updateFilter, removeFilter } = useFiltersActions();
  const { filters } = useFiltersState();
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const draft = draftId
    ? filters.find((filter) => filter.id === draftId)
    : undefined;
  const values = asStringArray(draft?.value);
  const selected = field.options.filter((option) =>
    values.includes(option.value),
  );
  const atMax =
    field.maxSelections != null && values.length >= field.maxSelections;

  return (
    <Combobox<FilterOption, true>
      inline
      open
      multiple
      autoHighlight
      items={field.options}
      value={selected}
      onValueChange={(next) => {
        if (field.maxSelections != null && next.length > field.maxSelections) {
          return;
        }
        const nextValues = next.map((option) => option.value);
        if (!draft) {
          const scalar = scalarOperatorFor(field);
          if (!scalar || nextValues.length === 0) return;
          const filter = createFilter(field, {
            operator: scalar.id,
            value: nextValues,
          });
          addFilter(filter);
          setDraftId(filter.id);
          return;
        }
        if (nextValues.length === 0) {
          removeFilter(draft.id);
          setDraftId(null);
          return;
        }
        updateFilter(draft.id, { value: nextValues });
      }}
      itemToStringLabel={(option) => option.label}
    >
      <div className="flex flex-col">
        <ComboboxInput
          ref={inputRef}
          showTrigger={false}
          showClear={false}
          placeholder={field.placeholder ?? labels.searchValues}
          start={<ScopeToken field={field} onBack={onBack} />}
          className={STEP_ROW}
          onKeyDown={(event) => backOnEmptyBackspace(event, onBack)}
        />
        <ComboboxEmpty>{labels.noResults}</ComboboxEmpty>
        <ComboboxList className={cn(LIST_WITH_FOOTER_HEIGHT, "py-1")}>
          {(option: FilterOption) => (
            <ComboboxItem
              key={option.value}
              value={option}
              disabled={atMax && !values.includes(option.value)}
              className="my-0!"
            >
              <OptionContent option={option} />
            </ComboboxItem>
          )}
        </ComboboxList>
        <div className="flex h-10 items-center justify-between gap-2 border-t ps-3 pe-1.5">
          <span className="text-muted-foreground text-xs tabular-nums">
            {values.length > 0
              ? labels.selectedCount(values.length, field)
              : ""}
          </span>
          <Button variant="ghost" size="xs" onClick={() => onDone()}>
            {labels.done}
          </Button>
        </div>
      </div>
    </Combobox>
  );
}

const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)$/;

function InputStep({
  field,
  inputRef,
  onBack,
  onDone,
}: ValueStepProps<TextFilterField | NumberFilterField>) {
  const { labels, addFilter } = useFiltersActions();
  const [text, setText] = React.useState("");
  const operator = scalarOperatorFor(field);
  const isNumber = field.type === "number";
  const decimal = text.trim().replace(",", ".");
  // Plain decimals only: `Number` would also take "0x10" or "1e3".
  const parsed = DECIMAL.test(decimal) ? Number(decimal) : NaN;
  const valid = text.trim() !== "" && (!isNumber || Number.isFinite(parsed));
  const invalid = text.trim() !== "" && !valid;
  const hintId = React.useId();

  const submit = () => {
    if (!valid || !operator) return;
    addFilter(
      createFilter(field, {
        operator: operator.id,
        value: isNumber ? parsed : text,
      }),
    );
    onDone();
  };

  return (
    <div
      data-slot="filter-add-input"
      // A single row, so no divider under it.
      className={cn("flex w-full items-center text-sm", STEP_ROW, "border-b-0")}
    >
      <ScopeToken field={field} onBack={onBack} />
      {operator && (
        <span className="text-muted-foreground shrink-0">
          {operatorLabel(operator, labels.operators)}
        </span>
      )}
      {typeof field.prefix === "string" && (
        // Pulls in 4px to match the chip's affix spacing.
        <span className="text-muted-foreground -me-1 shrink-0">
          {field.prefix}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode={isNumber ? "decimal" : undefined}
        aria-label={`${field.label} ${operator ? operatorLabel(operator, labels.operators) : ""}`.trim()}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? hintId : undefined}
        placeholder={field.placeholder ?? labels.enterValue}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
            return;
          }
          backOnEmptyBackspace(event, onBack);
        }}
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-full min-w-0 flex-1 bg-transparent text-base outline-none md:text-sm",
          isNumber && "tabular-nums",
          "aria-invalid:text-danger-foreground",
        )}
      />
      {typeof field.suffix === "string" && (
        <span className="text-muted-foreground shrink-0">{field.suffix}</span>
      )}
      {invalid && (
        <span
          id={hintId}
          className="text-danger-foreground shrink-0 text-xs whitespace-nowrap"
        >
          {labels.invalidNumber}
        </span>
      )}
      {valid && (
        // The Enter hint doubles as the pointer submit.
        <button
          type="button"
          aria-label={labels.addTooltip}
          onClick={submit}
          className="hover:bg-surface-hover focus-visible:outline-ring/50 -me-1.5 flex shrink-0 cursor-pointer items-center rounded-md p-0.5 outline-0 transition-[background-color,opacity,scale] duration-150 ease-out outline-solid focus-visible:outline-2 motion-reduce:transition-none starting:scale-90 starting:opacity-0"
        >
          <Kbd size="sm" aria-hidden>
            Enter
          </Kbd>
        </button>
      )}
    </div>
  );
}

function ValueStep(props: ValueStepProps<FilterField>) {
  const { field } = props;
  switch (field.type) {
    case "select":
      return <SelectStep {...props} field={field} />;
    case "multiselect":
      return <MultiSelectStep {...props} field={field} />;
    case "text":
    case "number":
      return <InputStep {...props} field={field} />;
    default:
      return null;
  }
}

// A chip's value control, focused after the menu adds that filter.
const CHIP_FOCUS_TARGET =
  '[data-slot="filter-chip-value"]:is(button, input), [data-slot="filter-chip-value"] :is(button, input, select, textarea, [tabindex]:not([tabindex="-1"]))';

interface AddMenuOptions {
  /** Key that opens this menu from the keyboard (e.g. `"f"`). */
  shortcut?: string;
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** Whether the menu starts open (uncontrolled). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type AddMenuProps = React.ComponentProps<typeof Button> & AddMenuOptions;

/** `kind="segment"` renders inside the `FilterActions` capsule; `button` standalone. */
function AddMenu({
  children,
  shortcut,
  className,
  onBlur,
  kind,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: AddMenuProps & { kind: "button" | "segment" }) {
  const { fieldsById, labels, size, usedFieldIds } = useFiltersActions();
  const compact = usedFieldIds.size > 0;
  const inActions = kind === "segment";
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const [step, setStep] = React.useState<"fields" | "value">("fields");
  // Kept after stepping back so the value view has content while sliding out.
  const [fieldId, setFieldId] = React.useState<string | null>(null);
  const field = fieldId ? fieldsById.get(fieldId) : undefined;
  // Bumped on each open to remount the panel.
  const [session, setSession] = React.useState(0);

  const fieldsInputRef = React.useRef<HTMLInputElement | null>(null);
  const valueInputRef = React.useRef<HTMLInputElement | null>(null);
  const focusFilterIdRef = React.useRef<string | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  // Scoped to this bar: two bars can show the same filters.
  const findChip = React.useCallback((filterId: string) => {
    const scope =
      triggerRef.current?.closest('[data-slot="filters"]') ?? document;
    return scope.querySelector<HTMLElement>(
      `[data-slot="filter-chip"][data-filter-id="${CSS.escape(filterId)}"]`,
    );
  }, []);

  // `keepMounted` keeps teardown off the main thread while a new chip animates
  // in; the panel is remounted on open instead (a reshown hidden panel would
  // replay its @starting-style entrance).
  // Closing restores focus to the button; until focus leaves it, focus-driven
  // tooltip opens are refused (hover still opens it).
  const [quietTooltip, setQuietTooltip] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  // Derived from `open` itself so it also runs for a controlled `open`.
  const [shownOpen, setShownOpen] = React.useState(open);
  if (open !== shownOpen) {
    setShownOpen(open);
    if (open) {
      setStep("fields");
      setFieldId(null);
      setSession((count) => count + 1);
    } else {
      setQuietTooltip(true);
    }
  }
  const changeOpen = React.useCallback(
    (nextOpen: boolean) => setOpen(nextOpen),
    [setOpen],
  );
  const wakeTooltip = React.useCallback(() => setQuietTooltip(false), []);

  React.useEffect(() => {
    if (!shortcut) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Also dedupes multiple Filters instances: the first to accept prevents it.
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      // Skip IME composition, key repeat, and keyless synthetic keydowns (autofill).
      if (event.isComposing || event.repeat || !event.key) return;
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target.isContentEditable
        ) {
          return;
        }
        // Don't steal the key from open popups (menu typeahead, dialogs).
        if (
          target.closest(
            '[role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"]',
          )
        ) {
          return;
        }
      }
      event.preventDefault();
      changeOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut, changeOpen]);

  const onDone = React.useCallback(
    (focusFilterId?: string) => {
      focusFilterIdRef.current = focusFilterId ?? null;
      changeOpen(false);
    },
    [changeOpen],
  );
  const onDrill = React.useCallback((id: string) => {
    setFieldId(id);
    setStep("value");
  }, []);
  const onBack = React.useCallback(() => setStep("fields"), []);

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      {/* Only once folded to "+" (the label is hidden) and while closed. */}
      <Tooltip
        disabled={!compact || open}
        open={tooltipOpen}
        onOpenChange={(nextOpen, details) => {
          if (nextOpen && quietTooltip && details.reason === "trigger-focus") {
            return;
          }
          setTooltipOpen(nextOpen);
        }}
      >
        <TooltipTrigger
          render={
            <PopoverTrigger
              ref={triggerRef}
              render={
                inActions ? (
                  <button
                    type="button"
                    data-slot="filter-add"
                    aria-keyshortcuts={shortcut?.toUpperCase()}
                    data-compact={compact ? "" : undefined}
                    onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
                      // Base UI's event type has extra fields; cast through.
                      onBlur?.(
                        event as Parameters<NonNullable<typeof onBlur>>[0],
                      );
                      wakeTooltip();
                    }}
                    className={cn(
                      FILTER_SEGMENT,
                      FILTER_SEGMENT_INTERACTIVE,
                      // Even icon inset, so the folded segment is square.
                      "text-muted-foreground hover:text-foreground data-popup-open:text-foreground gap-0 px-(--seg-icon-x)",
                      className,
                    )}
                    {...(props as React.ComponentProps<"button">)}
                  />
                ) : (
                  <Button
                    data-slot="filter-add"
                    aria-keyshortcuts={shortcut?.toUpperCase()}
                    data-compact={compact ? "" : undefined}
                    onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
                      // Base UI's event type has extra fields; cast through.
                      onBlur?.(
                        event as Parameters<NonNullable<typeof onBlur>>[0],
                      );
                      wakeTooltip();
                    }}
                    variant="outline"
                    size={size}
                    className={cn(
                      "text-muted-foreground hover:text-foreground data-popup-open:text-foreground gap-0",
                      // Matches the icon side; the label adds the rest when shown.
                      size === "sm" ? "pe-2" : "pe-2.5",
                      className,
                    )}
                    leadingIcon={
                      <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                    }
                    {...props}
                  />
                )
              }
            >
              {inActions && (
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  className="size-4 shrink-0"
                />
              )}
              {/* Folds via a grid column once filters exist: animates in every
                  browser (auto width doesn't) and stays readable to screen readers. */}
              <span
                data-slot="filter-add-label"
                className="grid grid-cols-[minmax(0,1fr)] overflow-hidden transition-[grid-template-columns,opacity] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] in-data-compact:grid-cols-[minmax(0,0fr)] in-data-compact:opacity-0 motion-reduce:transition-none"
              >
                <span
                  // Text side gets 2px more than the icon side: the "+" glyph has
                  // ~2.7px of internal space, so this balances by ink.
                  className="flex min-w-0 items-center gap-1.5 overflow-hidden ps-1.5 pe-0.5"
                >
                  {children ?? labels.add}
                  {shortcut && (
                    <Kbd size="sm" variant="ghost" aria-hidden>
                      {shortcut.toUpperCase()}
                    </Kbd>
                  )}
                </span>
              </span>
            </PopoverTrigger>
          }
        />
        <TooltipContent className="flex items-center gap-2">
          {labels.addTooltip}
          {shortcut && (
            <Kbd size="sm" variant="ghost">
              {shortcut.toUpperCase()}
            </Kbd>
          )}
        </TooltipContent>
      </Tooltip>
      <PopoverPortal keepMounted>
        <PopoverPositioner
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          // Glides with the button as chips enter and leave.
          className="z-50 transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none"
        >
          <PopoverPopup
            data-slot="filter-add-menu"
            aria-label={labels.add}
            initialFocus={fieldsInputRef}
            finalFocus={() => {
              const id = focusFilterIdRef.current;
              focusFilterIdRef.current = null;
              if (!id) return true;
              return (
                findChip(id)?.querySelector<HTMLElement>(CHIP_FOCUS_TARGET) ??
                true
              );
            }}
            className={cn(
              "w-72 overflow-clip",
              "ease-out-expo transition-[scale,opacity] duration-150",
              "data-starting-style:scale-95 data-starting-style:opacity-0",
              "data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-100",
              "motion-reduce:transition-none",
            )}
          >
            <TransitionPanel
              key={session}
              activeKey={step}
              // In step with the chips (default is 240ms).
              style={{ "--tp-duration": "200ms" } as React.CSSProperties}
            >
              <TransitionPanelView
                viewKey="fields"
                initialFocus={fieldsInputRef}
              >
                <FieldStep
                  inputRef={fieldsInputRef}
                  onDone={onDone}
                  onDrill={onDrill}
                  findChip={findChip}
                />
              </TransitionPanelView>
              <TransitionPanelView viewKey="value" initialFocus={valueInputRef}>
                {field && (
                  <ValueStep
                    key={field.id}
                    field={field}
                    inputRef={valueInputRef}
                    onBack={onBack}
                    onDone={onDone}
                  />
                )}
              </TransitionPanelView>
            </TransitionPanel>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}

/** Standalone add-filter outline button with its menu. */
function FilterAddButton(props: AddMenuProps) {
  return <AddMenu {...props} kind="button" />;
}

/** The add segment of a `FilterActions` capsule, for composing your own. */
function FilterActionsAdd(
  props: React.ComponentProps<"button"> & AddMenuOptions,
) {
  return <AddMenu {...(props as AddMenuProps)} kind="segment" />;
}

export {
  FilterAddButton,
  FilterActionsAdd,
  FieldIcon,
  OptionContent,
  SearchIcon,
  STEP_ROW,
};
