"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuFilter,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuList,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Kbd } from "@/registry/default/kbd/kbd";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";
import {
  POPUP_SEARCH_FIELD,
  POPUP_SEARCH_INPUT,
} from "@/registry/default/lib/popup-search";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/default/tooltip/tooltip";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

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

// Breathing room above the first option and below the last in the chips'
// value lists, dropped once nothing matches so the empty message sits evenly
// between the field and whatever follows.
const LIST_PADDING = "py-1 not-has-[[data-slot=combobox-item]]:py-0";

const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)$/;

/** Closes the menu, optionally handing focus to a newly added filter. */
type OnDone = (focusFilterId?: string) => void;

interface SubmenuProps<F extends FilterField> {
  field: F;
  disabled: boolean;
  onDone: OnDone;
}

function ValueSubmenuTrigger({
  field,
  disabled,
}: {
  field: FilterField;
  disabled: boolean;
}) {
  return (
    <DropdownMenuSubTrigger disabled={disabled} label={field.label}>
      <FieldIcon>{field.icon}</FieldIcon>
      <span className="truncate">{field.label}</span>
    </DropdownMenuSubTrigger>
  );
}

// A field with values opens them in its own searchable submenu, beside the
// menu (stacked over it where there's no room, like any submenu).
function ValueSubmenu(props: SubmenuProps<FilterField>) {
  const { field } = props;
  switch (field.type) {
    case "select":
      return <SelectSubmenu {...props} field={field} />;
    case "multiselect":
      return <MultiSelectSubmenu {...props} field={field} />;
    case "text":
    case "number":
      return <InputSubmenu {...props} field={field} />;
    default:
      return null;
  }
}

function SelectSubmenu({
  field,
  disabled,
  onDone,
}: SubmenuProps<SelectFilterField>) {
  const { labels, addFilter } = useFiltersActions();
  return (
    <DropdownMenuFilter>
      <DropdownMenuSub>
        <ValueSubmenuTrigger field={field} disabled={disabled} />
        <DropdownMenuSubContent className="w-60">
          <DropdownMenuInput
            aria-label={labels.searchFieldValues(field)}
            placeholder={field.placeholder ?? labels.searchFieldValues(field)}
          />
          <DropdownMenuEmpty>{labels.noResults}</DropdownMenuEmpty>
          <DropdownMenuList>
            {field.options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                label={option.label}
                onClick={() => {
                  const scalar = scalarOperatorFor(field);
                  if (!scalar) return;
                  addFilter(
                    createFilter(field, {
                      operator: scalar.id,
                      value: option.value,
                    }),
                  );
                  onDone();
                }}
              >
                <OptionContent option={option} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuList>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuFilter>
  );
}

// The first check adds the filter and later checks edit it live; clearing
// every check removes it again.
function MultiSelectSubmenu({
  field,
  disabled,
  onDone,
}: SubmenuProps<MultiSelectFilterField>) {
  const { labels, addFilter, updateFilter, removeFilter } = useFiltersActions();
  const { filters } = useFiltersState();
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const draft = draftId
    ? filters.find((filter) => filter.id === draftId)
    : undefined;
  const values = asStringArray(draft?.value);
  const atMax =
    field.maxSelections != null && values.length >= field.maxSelections;

  const toggle = (value: string, checked: boolean) => {
    const next = checked
      ? [...values, value]
      : values.filter((existing) => existing !== value);
    if (!draft) {
      const scalar = scalarOperatorFor(field);
      if (!scalar || next.length === 0) return;
      const filter = createFilter(field, { operator: scalar.id, value: next });
      addFilter(filter);
      setDraftId(filter.id);
      return;
    }
    if (next.length === 0) {
      removeFilter(draft.id);
      setDraftId(null);
      return;
    }
    updateFilter(draft.id, { value: next });
  };

  return (
    <DropdownMenuFilter>
      <DropdownMenuSub>
        <ValueSubmenuTrigger field={field} disabled={disabled} />
        <DropdownMenuSubContent className="w-60">
          <DropdownMenuInput
            aria-label={labels.searchFieldValues(field)}
            placeholder={field.placeholder ?? labels.searchFieldValues(field)}
          />
          <DropdownMenuEmpty>{labels.noResults}</DropdownMenuEmpty>
          <DropdownMenuList>
            {field.options.map((option) => {
              const checked = values.includes(option.value);
              return (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  label={option.label}
                  checked={checked}
                  disabled={atMax && !checked}
                  onCheckedChange={(next) => toggle(option.value, next)}
                >
                  <OptionContent option={option} />
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuList>
          {/* Edge to edge under the list: the negative margins cancel the
              submenu's 4px padding. */}
          <div className="-mx-1 mt-1 -mb-1 flex h-10 items-center justify-between gap-2 border-t ps-3.5 pe-1.5">
            <span className="text-muted-foreground text-xs tabular-nums">
              {values.length > 0
                ? labels.selectedCount(values.length, field)
                : ""}
            </span>
            <Button variant="ghost" size="xs" onClick={() => onDone()}>
              {labels.done}
            </Button>
          </div>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuFilter>
  );
}

// The value field, then the filter it would add as a row: Enter or a click
// adds it. The submenu's own matching is off (the field holds a value, not a
// search), and the row is always there (a prompt, the filter, or the error) so
// the submenu holds its height while typing.
function InputSubmenu({
  field,
  disabled,
  onDone,
}: SubmenuProps<TextFilterField | NumberFilterField>) {
  const { labels, addFilter } = useFiltersActions();
  const [text, setText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const operator = scalarOperatorFor(field);
  const isNumber = field.type === "number";
  const decimal = text.trim().replace(",", ".");
  // Plain decimals only: `Number` would also take "0x10" or "1e3".
  const parsed = DECIMAL.test(decimal) ? Number(decimal) : NaN;
  const valid = text.trim() !== "" && (!isNumber || Number.isFinite(parsed));
  const invalid = text.trim() !== "" && !valid;
  const prefix = typeof field.prefix === "string" ? field.prefix : null;
  const suffix = typeof field.suffix === "string" ? field.suffix : null;
  const operatorText = operator
    ? operatorLabel(operator, labels.operators)
    : "";

  return (
    <DropdownMenuFilter filter={null} value={text} onValueChange={setText}>
      <DropdownMenuSub
        onOpenChange={(open, details) => {
          // A tap or click on the row means "enter a value": put the caret
          // in the field (on touch, Base UI leaves focus alone). Hover-opens
          // don't, so sweeping past the row never steals the root search.
          if (open && details.reason === "trigger-press") {
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      >
        <ValueSubmenuTrigger field={field} disabled={disabled} />
        <DropdownMenuSubContent className="w-64">
          <div
            data-slot="filter-add-input"
            className={cn(POPUP_SEARCH_FIELD, "mb-1 h-8")}
          >
            {prefix && (
              // Pulls in 4px to match the chip's affix spacing.
              <span className="text-muted-foreground -me-1 shrink-0 text-sm">
                {prefix}
              </span>
            )}
            <BaseMenu.Input
              ref={inputRef}
              aria-label={`${field.label} ${operatorText}`.trim()}
              aria-invalid={invalid || undefined}
              inputMode={isNumber ? "decimal" : undefined}
              placeholder={field.placeholder ?? labels.enterValue}
              className={cn(
                POPUP_SEARCH_INPUT,
                isNumber && "tabular-nums",
                "aria-invalid:text-danger-foreground",
              )}
            />
            {suffix && (
              <span className="text-muted-foreground shrink-0 text-sm">
                {suffix}
              </span>
            )}
          </div>
          <DropdownMenuEmpty
            className={cn(invalid && "text-danger-foreground")}
          >
            {invalid ? labels.invalidNumber : `${field.label} ${operatorText}…`}
          </DropdownMenuEmpty>
          <DropdownMenuList>
            {valid && operator && (
              <DropdownMenuItem
                onClick={() => {
                  addFilter(
                    createFilter(field, {
                      operator: operator.id,
                      value: isNumber ? parsed : text,
                    }),
                  );
                  onDone();
                }}
              >
                <span className="text-muted-foreground shrink-0">
                  {field.label} {operatorText}
                </span>
                <span className="truncate font-medium">
                  {prefix}
                  {isNumber ? parsed : `“${text}”`}
                  {suffix && ` ${suffix}`}
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuList>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuFilter>
  );
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
  const {
    fields,
    labels,
    size,
    usedFieldIds,
    allowDuplicateFields,
    addFilter,
    updateFilter,
    getFilters,
  } = useFiltersActions();
  const compact = usedFieldIds.size > 0;
  const inActions = kind === "segment";
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  // The root's search. Base UI clears it when the menu closes.
  const [query, setQuery] = React.useState("");
  // Values join the list only while searching.
  const searching = query.trim() !== "";

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

  // Closing restores focus to the button; until focus leaves it, focus-driven
  // tooltip opens are refused (hover still opens it).
  const [quietTooltip, setQuietTooltip] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  // Derived from `open` itself so it also runs for a controlled `open`.
  const [shownOpen, setShownOpen] = React.useState(open);
  if (open !== shownOpen) {
    setShownOpen(open);
    if (!open) setQuietTooltip(true);
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

  const onDone = React.useCallback<OnDone>(
    (focusFilterId) => {
      focusFilterIdRef.current = focusFilterId ?? null;
      changeOpen(false);
    },
    [changeOpen],
  );

  const optionItems = React.useMemo(
    () =>
      fields.flatMap((field) =>
        (field.type === "select" || field.type === "multiselect") &&
        scalarOperatorFor(field)
          ? field.options.map((option) => ({ field, option }))
          : [],
      ),
    [fields],
  );

  const pickOption = (field: OptionsField, option: FilterOption) => {
    const scalar = scalarOperatorFor(field);
    if (!scalar) return;
    // Without duplicates, a searched value joins the field's existing filter.
    // Filters are read via `getFilters`, not subscribed, so the menu doesn't
    // re-render on every chip keystroke.
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
    <DropdownMenuFilter value={query} onValueChange={setQuery}>
      <DropdownMenu open={open} onOpenChange={changeOpen}>
        {/* Only once folded to "+" (the label is hidden) and while closed. */}
        <Tooltip
          disabled={!compact || open}
          open={tooltipOpen}
          onOpenChange={(nextOpen, details) => {
            if (
              nextOpen &&
              quietTooltip &&
              details.reason === "trigger-focus"
            ) {
              return;
            }
            setTooltipOpen(nextOpen);
          }}
        >
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
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
                        // The "+" sits in the side padding; folded, the
                        // padding goes and the "+" square (below) sets the width.
                        "text-muted-foreground hover:text-foreground data-popup-open:text-foreground gap-0 px-(--seg-icon-x) data-compact:px-0",
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
                  // Folded to "+", a square as tall as the plate, so the
                  // segment stays square at any display scale.
                  <span className="flex h-full shrink-0 items-center justify-center in-data-compact:aspect-square">
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </span>
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
              </DropdownMenuTrigger>
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
        <DropdownMenuContent
          aria-label={labels.add}
          align="start"
          sideOffset={6}
          className="w-64"
          finalFocus={() => {
            const id = focusFilterIdRef.current;
            focusFilterIdRef.current = null;
            if (!id) return true;
            return (
              findChip(id)?.querySelector<HTMLElement>(CHIP_FOCUS_TARGET) ??
              true
            );
          }}
        >
          <DropdownMenuInput
            aria-label={labels.searchFields}
            placeholder={labels.searchFields}
          />
          <DropdownMenuEmpty>{labels.noFields}</DropdownMenuEmpty>
          <DropdownMenuList>
            <DropdownMenuGroup>
              {searching && (
                <DropdownMenuGroupLabel>{labels.fields}</DropdownMenuGroupLabel>
              )}
              {fields.map((field) => {
                const disabled =
                  !allowDuplicateFields && usedFieldIds.has(field.id);
                if (!hasValueStep(field)) {
                  return (
                    <DropdownMenuItem
                      key={field.id}
                      label={field.label}
                      disabled={disabled}
                      onClick={() => {
                        const filter = createFilter(field);
                        addFilter(filter);
                        onDone(filter.id);
                      }}
                    >
                      <FieldIcon>{field.icon}</FieldIcon>
                      <span className="truncate">{field.label}</span>
                    </DropdownMenuItem>
                  );
                }
                return (
                  <ValueSubmenu
                    key={field.id}
                    field={field}
                    disabled={disabled}
                    onDone={onDone}
                  />
                );
              })}
            </DropdownMenuGroup>
            {searching && <DropdownMenuSeparator />}
            {searching && (
              <DropdownMenuGroup>
                <DropdownMenuGroupLabel>{labels.values}</DropdownMenuGroupLabel>
                {optionItems.map(({ field, option }) => (
                  <DropdownMenuItem
                    key={`${field.id}:${option.value}`}
                    label={option.label}
                    onClick={() => pickOption(field, option)}
                  >
                    <OptionContent option={option} />
                    <span className="text-muted-foreground ms-auto shrink-0 text-xs">
                      {field.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
          </DropdownMenuList>
        </DropdownMenuContent>
      </DropdownMenu>
    </DropdownMenuFilter>
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
  LIST_PADDING,
  OptionContent,
};
