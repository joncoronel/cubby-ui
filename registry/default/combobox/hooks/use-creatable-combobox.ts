import * as React from "react";

export interface UseCreatableComboboxOptions<
  T extends { id: string; value: string },
> {
  /**
   * Controlled items for the combobox
   */
  items: T[];

  /**
   * Callback when items change
   */
  onItemsChange: (items: T[]) => void;

  /**
   * Controlled selected items
   */
  selectedItems: T[];

  /**
   * Callback when selected items change
   */
  onSelectedItemsChange: (items: T[]) => void;
}

export interface UseCreatableComboboxReturn<
  T extends { id: string; value: string },
> {
  /**
   * Items array with pseudo "Create X" item injected when applicable
   */
  itemsWithCreatable: Array<T & { creatable?: string }>;

  /**
   * Props to spread onto the Combobox component
   */
  comboboxProps: {
    value: T[];
    onValueChange: (value: unknown) => void;
    inputValue: string;
    onInputValueChange: (value: string) => void;
    onOpenChange: (
      open: boolean,
      details: { event: Event | React.SyntheticEvent },
    ) => void;
  };

  /**
   * Props to spread onto the Dialog component
   */
  dialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };

  /**
   * Props to spread onto the dialog input element
   */
  dialogInputProps: {
    ref: React.RefObject<HTMLInputElement | null>;
    defaultValue: string;
  };

  /**
   * Form submit handler (handles preventDefault internally)
   */
  onDialogSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

  /**
   * Dialog cancel handler
   */
  handleCancel: () => void;
}

/**
 * Slugify a string to create a valid ID
 */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

/**
 * Generate a unique ID from a value, handling collisions
 */
function generateUniqueId<T extends { id: string }>(
  value: string,
  existingItems: T[],
): string {
  const baseId = slugify(value);
  const existingIds = new Set(existingItems.map((item) => item.id));

  let uniqueId = baseId;
  if (existingIds.has(uniqueId)) {
    let counter = 2;
    while (existingIds.has(`${baseId}-${counter}`)) {
      counter += 1;
    }
    uniqueId = `${baseId}-${counter}`;
  }

  return uniqueId;
}

/**
 * Hook to manage creatable combobox state and logic
 *
 * This hook encapsulates all the complex logic needed for a creatable combobox:
 * - Injecting a pseudo "Create X" item when the query doesn't match existing items
 * - Handling item creation via a confirmation dialog with automatic ID generation
 * - Normalizing values and checking for duplicates
 *
 * @example
 * ```tsx
 * const [items, setItems] = useState(initialLabels);
 * const [selectedItems, setSelectedItems] = useState<LabelItem[]>([]);
 *
 * const { itemsWithCreatable, comboboxProps, dialogProps, dialogInputProps, onDialogSubmit, handleCancel } =
 *   useCreatableCombobox({
 *     items,
 *     onItemsChange: setItems,
 *     selectedItems,
 *     onSelectedItemsChange: setSelectedItems,
 *   });
 * ```
 */
export function useCreatableCombobox<T extends { id: string; value: string }>({
  items,
  onItemsChange,
  selectedItems,
  onSelectedItemsChange,
}: UseCreatableComboboxOptions<T>): UseCreatableComboboxReturn<T> {
  const [query, setQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [pendingValue, setPendingValue] = React.useState("");

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Helper to normalize values for comparison
  const normalize = React.useCallback((value: string) => {
    return value.trim().toLowerCase();
  }, []);

  // Helper to check if an item already exists
  const itemExists = React.useCallback(
    (value: string) => {
      const normalized = normalize(value);
      return items.some((item) => normalize(item.value) === normalized);
    },
    [items, normalize],
  );

  // Create the items array with pseudo "Create X" item if needed
  const itemsWithCreatable = React.useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || itemExists(trimmed)) {
      return items;
    }

    // Add pseudo item
    const normalized = normalize(trimmed);
    return [
      ...items,
      {
        id: `create:${normalized}`,
        value: `Create "${trimmed}"`,
        creatable: trimmed,
      } as T & { creatable: string },
    ];
  }, [items, query, itemExists, normalize]);

  // Handle item creation
  const handleCreate = React.useCallback(() => {
    const value = pendingValue.trim();
    if (!value) return;

    // Check if item already exists
    if (itemExists(value)) {
      const existing = items.find(
        (item) => normalize(item.value) === normalize(value),
      );
      if (
        existing &&
        !selectedItems.some((item) => item.id === existing.id)
      ) {
        onSelectedItemsChange([...selectedItems, existing]);
      }
      setDialogOpen(false);
      setQuery("");
      setPendingValue("");
      return;
    }

    // Create new item with auto-generated ID
    const id = generateUniqueId(value, items);
    const newItem = { id, value } as T;

    onItemsChange([...items, newItem]);
    onSelectedItemsChange([...selectedItems, newItem]);
    setDialogOpen(false);
    setQuery("");
    setPendingValue("");
  }, [
    pendingValue,
    items,
    selectedItems,
    onItemsChange,
    onSelectedItemsChange,
    itemExists,
    normalize,
  ]);

  // Handle value change from combobox
  const handleValueChange = React.useCallback(
    (value: unknown) => {
      const valueArray = Array.isArray(value) ? value : value ? [value] : [];
      const last = valueArray[valueArray.length - 1];

      // Check if the last selected item is the pseudo "Create X" item
      if (last && "creatable" in last && last.creatable) {
        setPendingValue(last.creatable);
        setDialogOpen(true);
        return;
      }

      // Filter out any pseudo items and update selected
      const cleanValue = valueArray.filter(
        (item) => !("creatable" in item && item.creatable),
      );
      onSelectedItemsChange(cleanValue as T[]);
      setQuery("");
    },
    [onSelectedItemsChange],
  );

  // Handle combobox open/close - intercept Enter key to open dialog
  const handleOpenChange = React.useCallback(
    (
      open: boolean,
      details: { event: Event | React.SyntheticEvent },
    ) => {
      // Check if Enter key was pressed with a query that doesn't match
      if (
        "key" in details.event &&
        (details.event as KeyboardEvent).key === "Enter"
      ) {
        const trimmed = query.trim();
        if (!trimmed) return;

        // Check if item exists
        if (itemExists(trimmed)) {
          const existing = items.find(
            (item) => normalize(item.value) === normalize(trimmed),
          );
          if (
            existing &&
            !selectedItems.some((item) => item.id === existing.id)
          ) {
            onSelectedItemsChange([...selectedItems, existing]);
          }
          setQuery("");
          return;
        }

        // Open dialog for new item creation
        setPendingValue(trimmed);
        setDialogOpen(true);
      }
    },
    [query, items, selectedItems, itemExists, normalize, onSelectedItemsChange],
  );

  // Dialog submit handler
  const onDialogSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleCreate();
    },
    [handleCreate],
  );

  // Dialog cancel handler
  const handleCancel = React.useCallback(() => {
    setDialogOpen(false);
    setPendingValue("");
  }, []);

  return {
    itemsWithCreatable,
    comboboxProps: {
      value: selectedItems,
      onValueChange: handleValueChange,
      inputValue: query,
      onInputValueChange: setQuery,
      onOpenChange: handleOpenChange,
    },
    dialogProps: {
      open: dialogOpen,
      onOpenChange: setDialogOpen,
    },
    dialogInputProps: {
      ref: inputRef,
      defaultValue: pendingValue,
    },
    onDialogSubmit,
    handleCancel,
  };
}
