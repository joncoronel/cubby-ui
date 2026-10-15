"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuEmpty,
  DropdownMenuFilter,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuList,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
  POPUP_SEARCH_MENU_FIELD,
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
  allowsDuplicates,
  asStringArray,
  createFilter,
  isOptionField,
  nameFromPlaceholder,
  operatorLabel,
  FILTER_SEGMENT,
  FILTER_SEGMENT_INTERACTIVE,
  operatorShapeFor,
  scalarOperatorFor,
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

/** An option field with a value step: its submenu edits its one chip. */
function editsInPlace(field: FilterField): field is OptionsField {
  return isOptionField(field) && hasValueStep(field);
}

const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)$/;

// Submenu positioners don't glide: submenus switch as the pointer sweeps down
// the list, and each sits beside its own row.
const SUBMENU_POSITIONER_STATIC = "transition-none";

/** Closes the menu, optionally handing focus to a newly added filter. */
type OnDone = (focusFilterId?: string) => void;

interface SubmenuProps<F extends FilterField> {
  field: F;
  disabled: boolean;
  onDone: OnDone;
}

interface OptionFilter {
  /** The field's chip, if it has one. */
  filterId: string | undefined;
  /** The checked option values. */
  values: string[];
  /** Adds the chip, edits it, or removes it once nothing is checked. */
  write: (next: string[]) => void;
  /** Whether a multiselect has reached its `maxSelections`. */
  atMax: boolean;
}

/**
 * An option field's one filter and how to write it, shared by the submenus and
 * search so they agree on what is checked.
 */
function useOptionFilter(field: OptionsField): OptionFilter {
  const { addFilter, updateFilter, removeFilter } = useFiltersActions();
  const { filters } = useFiltersState();
  const filter = filters.find((candidate) => candidate.field === field.id);
  // An "is empty" chip holds no value; writing one switches it to "is".
  const valueless =
    filter !== undefined && operatorShapeFor(field, filter.operator) === "none";
  const values =
    filter === undefined || valueless
      ? []
      : field.type === "multiselect"
        ? asStringArray(filter.value)
        : typeof filter.value === "string"
          ? [filter.value]
          : [];

  const write = (next: string[]) => {
    const scalar = scalarOperatorFor(field);
    if (!scalar) return;
    const value = field.type === "multiselect" ? next : next[0];
    if (!filter) {
      if (next.length > 0) {
        addFilter(createFilter(field, { operator: scalar.id, value }));
      }
      return;
    }
    if (next.length === 0) {
      removeFilter(filter.id);
      return;
    }
    updateFilter(filter.id, {
      ...(valueless && { operator: scalar.id }),
      value,
    });
  };

  const atMax =
    field.type === "multiselect" &&
    field.maxSelections != null &&
    values.length >= field.maxSelections;

  return { filterId: filter?.id, values, write, atMax };
}

function toggled(values: string[], value: string, checked: boolean): string[] {
  return checked
    ? [...values, value]
    : values.filter((existing) => existing !== value);
}

function ValueSubmenuTrigger({
  field,
  disabled,
}: {
  field: FilterField;
  disabled: boolean;
}) {
  return (
    // Submenus have no exit animation: without the delay a fast sweep closes
    // the old one before the next renders, leaving a blank frame. Opening one
    // closes its sibling at once, so two never stay open.
    <DropdownMenuSubTrigger
      disabled={disabled}
      label={field.label}
      closeDelay={1}
    >
      <FieldIcon>{field.icon}</FieldIcon>
      <span className="truncate">{field.label}</span>
    </DropdownMenuSubTrigger>
  );
}

// A field's searchable value submenu. Memoised so a filter change skips the
// text and number submenus; option submenus read filter state regardless.
const ValueSubmenu = React.memo(function ValueSubmenu(
  props: SubmenuProps<FilterField>,
) {
  const { field } = props;
  switch (field.type) {
    case "select":
    case "multiselect":
      return <OptionsSubmenu {...props} field={field} />;
    case "text":
    case "number":
      return <InputSubmenu {...props} field={field} />;
    default:
      return null;
  }
});

// An option field's values as menu items: radios for a single choice,
// checkboxes for several. A single choice closes the menu on any pick;
// checkboxes close it only in search, which jumps straight to a value.
function OptionItems({
  field,
  inSearch = false,
  trailing,
  onEdited,
}: {
  field: OptionsField;
  inSearch?: boolean;
  /** Shown at the end of each row, e.g. the field's name in search. */
  trailing?: React.ReactNode;
  /** Called with the chip's id when a pick changed an existing chip. */
  onEdited?: (filterId: string) => void;
}): React.ReactNode {
  const { filterId, values, write, atMax } = useOptionFilter(field);
  const pick = (next: string[]) => {
    write(next);
    if (filterId) onEdited?.(filterId);
  };

  if (field.type === "select") {
    return (
      <DropdownMenuRadioGroup
        value={values[0] ?? null}
        onValueChange={(value: string) => pick([value])}
      >
        {field.options.map((option) => (
          <DropdownMenuRadioItem
            key={option.value}
            value={option.value}
            label={option.label}
            closeOnClick
          >
            <OptionContent option={option} />
            {trailing}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    );
  }

  return field.options.map((option) => {
    const checked = values.includes(option.value);
    return (
      <DropdownMenuCheckboxItem
        key={option.value}
        label={option.label}
        checked={checked}
        disabled={atMax && !checked}
        closeOnClick={inSearch}
        onCheckedChange={(next) => pick(toggled(values, option.value, next))}
      >
        <OptionContent option={option} />
        {trailing}
      </DropdownMenuCheckboxItem>
    );
  });
}

// A select or multiselect field's searchable submenu. Multiselect adds a
// footer with the count and a Done button, since its checks keep it open.
function OptionsSubmenu({
  field,
  disabled,
  onDone,
}: SubmenuProps<OptionsField>): React.ReactElement {
  const { labels } = useFiltersActions();
  const { values } = useOptionFilter(field);

  return (
    <DropdownMenuFilter>
      <DropdownMenuSub>
        <ValueSubmenuTrigger field={field} disabled={disabled} />
        <DropdownMenuSubContent
          className="w-60"
          viewportClassName="p-0"
          positionerClassName={SUBMENU_POSITIONER_STATIC}
        >
          <DropdownMenuInput
            aria-label={nameFromPlaceholder(labels.searchFieldValues(field))}
            placeholder={field.placeholder ?? labels.searchFieldValues(field)}
          />
          <DropdownMenuEmpty>{labels.noResults}</DropdownMenuEmpty>
          <DropdownMenuList>
            <OptionItems field={field} />
          </DropdownMenuList>
          {field.type === "multiselect" && (
            // Edge to edge; the list's own 4px padding sits above it. The same
            // 4px gutter sizes the band, and the count lines up with the labels.
            <div className="flex items-center justify-between gap-2 border-t p-1 ps-3.5">
              <span className="text-muted-foreground text-xs tabular-nums">
                {values.length > 0
                  ? labels.selectedCount(values.length, field)
                  : ""}
              </span>
              <Button variant="ghost" size="xs" onClick={() => onDone()}>
                {labels.done}
              </Button>
            </div>
          )}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuFilter>
  );
}

// The value field, then the filter it would add as a row. Matching is off
// since the field holds a value, and the row always renders so the submenu
// keeps its height while typing.
function InputSubmenu({
  field,
  disabled,
  onDone,
}: SubmenuProps<TextFilterField | NumberFilterField>) {
  const { labels, addFilter } = useFiltersActions();
  const [text, setText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const hintId = React.useId();
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
          // A tap or click puts the caret in the field (on touch, Base UI
          // leaves focus alone). Hover-opens don't, so a sweep never steals
          // the root search.
          if (open && details.reason === "trigger-press") {
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      >
        <ValueSubmenuTrigger field={field} disabled={disabled} />
        <DropdownMenuSubContent
          className="w-64"
          viewportClassName="p-0"
          positionerClassName={SUBMENU_POSITIONER_STATIC}
        >
          <div
            data-slot="filter-add-input"
            className={cn(POPUP_SEARCH_FIELD, POPUP_SEARCH_MENU_FIELD)}
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
              aria-describedby={invalid ? hintId : undefined}
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
            id={hintId}
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

  // Option fields whose values join the results while searching.
  const optionFields = React.useMemo(
    () => fields.filter(editsInPlace),
    [fields],
  );

  // An edited chip may sit outside a scrolling bar; bring it into view.
  const revealChip = React.useCallback(
    (filterId: string) => {
      requestAnimationFrame(() => {
        const chip = findChip(filterId);
        if (chip) revealInScroller(chip);
      });
    },
    [findChip],
  );

  return (
    <DropdownMenuFilter value={query} onValueChange={setQuery}>
      {/* Non-modal: a modal menu measures its trigger while rendering, forcing
          a layout mid chip entrance when a pick closes the menu. */}
      <DropdownMenu open={open} onOpenChange={changeOpen} modal={false}>
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
                        // Folded, the side padding goes and the "+" square
                        // below sets the width.
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
                {/* A grid column folds it: animates in every browser (auto width
                    doesn't) and stays readable to screen readers. */}
                <span
                  data-slot="filter-add-label"
                  className="grid grid-cols-[minmax(0,1fr)] overflow-hidden transition-[grid-template-columns,opacity] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] in-data-compact:grid-cols-[minmax(0,0fr)] in-data-compact:opacity-0 motion-reduce:transition-none"
                >
                  <span
                    // 2px more than the icon side: the "+" glyph has ~2.7px of
                    // internal space, so this balances by ink.
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
        <DropdownMenuPortal>
          {/* Composed without DropdownMenuContent's viewport: this menu never
              swaps content, and without it Base UI positions with `transform`
              at whole pixels, following the trigger without a glide. */}
          <DropdownMenuPositioner
            side="bottom"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            className="z-50"
          >
            <DropdownMenuPopup
              aria-label={labels.add}
              className="flex w-64 flex-col"
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
                aria-label={nameFromPlaceholder(labels.searchFields)}
                placeholder={labels.searchFields}
              />
              <DropdownMenuEmpty>{labels.noFields}</DropdownMenuEmpty>
              <DropdownMenuList>
                <DropdownMenuGroup>
                  {searching && (
                    <DropdownMenuGroupLabel>
                      {labels.fields}
                    </DropdownMenuGroupLabel>
                  )}
                  {fields.map((field) => {
                    const valueStep = hasValueStep(field);
                    // Option fields edit their one filter in place, so they
                    // stay open; the rest close once used unless they repeat.
                    const disabled =
                      usedFieldIds.has(field.id) &&
                      !(valueStep && isOptionField(field)) &&
                      !allowsDuplicates(field, allowDuplicateFields);
                    if (!valueStep) {
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
                    <DropdownMenuGroupLabel>
                      {labels.values}
                    </DropdownMenuGroupLabel>
                    {optionFields.map((field) => (
                      <OptionItems
                        key={field.id}
                        field={field}
                        inSearch
                        onEdited={revealChip}
                        trailing={
                          <span className="text-muted-foreground ms-auto shrink-0 text-xs">
                            {field.label}
                          </span>
                        }
                      />
                    ))}
                  </DropdownMenuGroup>
                )}
              </DropdownMenuList>
            </DropdownMenuPopup>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
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

export { FilterAddButton, FilterActionsAdd, FieldIcon, OptionContent };
