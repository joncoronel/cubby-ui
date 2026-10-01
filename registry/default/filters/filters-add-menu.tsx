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
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
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

/** Small muted wrapper that sizes field icons to the surrounding text. */
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

/** Whether picking this field opens a value step rather than adding at once. */
function hasValueStep(field: FilterField): boolean {
  return field.type !== "custom" && scalarOperatorFor(field) !== undefined;
}

// The search row that heads every step: borderless, ruled off from the list
// by a hairline, so the popup reads as one surface rather than a field
// floating on a card.
const STEP_ROW =
  "h-11 gap-2 rounded-none border-0 border-b sm:h-11 bg-transparent px-3 outline-0 focus-within:outline-0 focus-within:outline-offset-0 dark:bg-transparent";

// A flex column, as inside a Combobox popup: it is what lets the list's
// scroll area resolve its height, so the step measures (and animates to)
// exactly its rows.
const STEP_COLUMN = "flex flex-col";

// Lists give up height before the rows around them do, so a menu squeezed
// against the viewport edge keeps its search row and footer in view.
// `--available-height` comes from the positioner.
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

/**
 * The drilled-in field, pinned to the start of the step's input. It doubles
 * as the way back, and Backspace in the empty input goes back too.
 */
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

// ----- Step 1: fields (and, while searching, values) ---------------------

function FieldStep({
  inputRef,
  onDone,
  onDrill,
}: StepProps & { onDrill: (fieldId: string) => void }) {
  const {
    fields,
    labels,
    usedFieldIds,
    allowDuplicateFields,
    addFilter,
    updateFilter,
  } = useFiltersActions();
  const { filters } = useFiltersState();
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
  // Values join the list only once there's a query: browsing shows fields,
  // searching reaches straight through to the value you meant.
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
    // With one filter per field, a value found by search joins the filter
    // that's already there instead of being refused.
    const existing = allowDuplicateFields
      ? undefined
      : filters.find((filter) => filter.field === field.id);
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
      // It may be scrolled out of a crowded bar; bring it back into view.
      requestAnimationFrame(() => {
        const chip = document.querySelector<HTMLElement>(
          `[data-slot="filter-chip"][data-filter-id="${CSS.escape(existing.id)}"]`,
        );
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
      <div className={STEP_COLUMN}>
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

// ----- Step 2: the drilled-in field's value ------------------------------

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
      <div className={STEP_COLUMN}>
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

/**
 * Multiselect values toggle in place. The first pick adds the filter and
 * later picks edit it, so the chip grows in the bar behind the menu as you
 * choose; clearing every pick takes the chip back out.
 */
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
      <div className={STEP_COLUMN}>
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

/**
 * Text and number fields take their value in the step's own row: the field,
 * its operator, then the input, read left to right as the chip will.
 */
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
  const parsed = isNumber ? Number(text.trim().replace(",", ".")) : NaN;
  const valid = text.trim() !== "" && (!isNumber || Number.isFinite(parsed));

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
      // The whole step is this one row, so it drops the divider that rules
      // the other steps' search off from their lists.
      className={cn("flex w-full items-center text-sm", STEP_ROW, "border-b-0")}
    >
      <ScopeToken field={field} onBack={onBack} />
      {operator && (
        <span className="text-muted-foreground shrink-0">{operator.label}</span>
      )}
      {typeof field.prefix === "string" && (
        // The row's 8px gap less 4px: the same affix spacing as the chip.
        <span className="text-muted-foreground -me-1 shrink-0">
          {field.prefix}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode={isNumber ? "decimal" : undefined}
        aria-label={`${field.label} ${operator?.label ?? ""}`.trim()}
        aria-invalid={text.trim() !== "" && !valid ? true : undefined}
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
      {/* Mounted only once there's something to submit, so it never takes
          room from the placeholder. */}
      {valid && (
        <Kbd
          size="sm"
          aria-hidden
          className="shrink-0 transition-[opacity,scale] duration-150 ease-out motion-reduce:transition-none starting:scale-90 starting:opacity-0"
        >
          Enter
        </Kbd>
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

// ----- The button and its menu -------------------------------------------

/** Matches the ready-made value control of a chip, for handing focus to it. */
const CHIP_FOCUS_TARGET =
  '[data-slot="filter-chip-value"]:is(button, input), [data-slot="filter-chip-value"] :is(button, input, select, textarea, [tabindex]:not([tabindex="-1"]))';

function FilterAddButton({
  children,
  shortcut,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  /** Key that opens this menu from the keyboard (e.g. `"f"`). */
  shortcut?: string;
}) {
  const { fieldsById, labels, size, usedFieldIds } = useFiltersActions();
  const compact = usedFieldIds.size > 0;
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<"fields" | "value">("fields");
  // Kept after stepping back so the value view still has content while it
  // slides out; cleared once the menu has closed.
  const [fieldId, setFieldId] = React.useState<string | null>(null);
  const field = fieldId ? fieldsById.get(fieldId) : undefined;

  const fieldsInputRef = React.useRef<HTMLInputElement | null>(null);
  const valueInputRef = React.useRef<HTMLInputElement | null>(null);
  const focusFilterIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!shortcut) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // `defaultPrevented` also dedupes multiple Filters instances: the first
      // listener to accept the key prevents it for the rest.
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
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
      setOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcut]);

  const onDone = React.useCallback((focusFilterId?: string) => {
    focusFilterIdRef.current = focusFilterId ?? null;
    setOpen(false);
  }, []);
  const onDrill = React.useCallback((id: string) => {
    setFieldId(id);
    setStep("value");
  }, []);
  const onBack = React.useCallback(() => setStep("fields"), []);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(nextOpen) => {
        if (nextOpen) return;
        setStep("fields");
        setFieldId(null);
      }}
    >
      <PopoverTrigger
        render={
          <Button
            data-slot="filter-add"
            data-compact={compact ? "" : undefined}
            variant="outline"
            size={size}
            className={cn(
              "text-muted-foreground hover:text-foreground data-popup-open:text-foreground gap-0",
              // Even with the icon's side; the label adds the rest when shown.
              size === "sm" ? "pe-2" : "pe-2.5",
              className,
            )}
            leadingIcon={<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />}
            {...props}
          />
        }
      >
        {/* The label (and shortcut hint) collapse through a grid column
            once filters exist, leaving a square "+": the chips beside it
            already say what it adds. A column animates in every browser,
            where an auto width doesn't, and the text stays readable to
            screen readers at zero width. */}
        <span
          data-slot="filter-add-label"
          className="grid grid-cols-[minmax(0,1fr)] overflow-hidden transition-[grid-template-columns,opacity] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] in-data-compact:grid-cols-[minmax(0,0fr)] in-data-compact:opacity-0 motion-reduce:transition-none"
        >
          <span className="flex min-w-0 items-center gap-1.5 overflow-hidden ps-1.5 pe-1">
            {children ?? labels.add}
            {shortcut && (
              <Kbd size="sm" variant="ghost">
                {shortcut.toUpperCase()}
              </Kbd>
            )}
          </span>
        </span>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          // Glides with the button as chips enter and leave beside it.
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
              const chip = document.querySelector(
                `[data-slot="filter-chip"][data-filter-id="${CSS.escape(id)}"]`,
              );
              return (
                chip?.querySelector<HTMLElement>(CHIP_FOCUS_TARGET) ?? true
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
              activeKey={step}
              // Quicker than the 240ms default, in step with the chips.
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

export { FilterAddButton, FieldIcon, OptionContent };
