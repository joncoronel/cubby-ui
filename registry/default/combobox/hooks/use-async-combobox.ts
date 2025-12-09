import * as React from "react";

export interface UseAsyncComboboxOptions<T extends { id: string }> {
  /**
   * Async search function that receives the query and an AbortSignal.
   * Should return an array of items matching the query.
   */
  searchFn: (query: string, signal: AbortSignal) => Promise<T[]>;

  /**
   * Debounce delay in milliseconds. Defaults to 0 (no debounce).
   */
  debounceMs?: number;
}

export interface UseAsyncComboboxSingleOptions<T extends { id: string }>
  extends UseAsyncComboboxOptions<T> {
  /**
   * Whether multiple selection is enabled
   */
  multiple?: false;

  /**
   * Controlled selected value
   */
  value?: T | null;

  /**
   * Callback when value changes
   */
  onValueChange?: (value: T | null) => void;
}

export interface UseAsyncComboboxMultipleOptions<T extends { id: string }>
  extends UseAsyncComboboxOptions<T> {
  /**
   * Whether multiple selection is enabled
   */
  multiple: true;

  /**
   * Controlled selected values
   */
  value?: T[];

  /**
   * Callback when values change
   */
  onValueChange?: (value: T[]) => void;
}

export interface UseAsyncComboboxReturn<T extends { id: string }> {
  /**
   * Items array with search results merged with selected values.
   * Selected values are always kept in the list during search.
   */
  items: T[];

  /**
   * Props to spread onto the Combobox component
   */
  comboboxProps: {
    inputValue: string;
    onInputValueChange: (
      value: string,
      details: { reason: string; event: Event | React.SyntheticEvent },
    ) => void;
    filter: null;
    onOpenChangeComplete: (open: boolean) => void;
  };

  /**
   * Whether a search is in progress
   */
  isPending: boolean;

  /**
   * Error message if the search failed
   */
  error: string | null;

  /**
   * Trimmed input value for status message logic
   */
  query: string;
}

/**
 * Hook to manage async search combobox state and logic
 *
 * This hook encapsulates the complex logic needed for async search:
 * - AbortController for canceling in-flight requests
 * - useTransition for pending states
 * - Merging search results with selected values to keep them visible
 * - Clearing results when popup closes
 *
 * @example
 * ```tsx
 * const [value, setValue] = useState<Employee | null>(null);
 *
 * const { items, comboboxProps, isPending, error, query } = useAsyncCombobox({
 *   searchFn: searchEmployees,
 *   value,
 *   onValueChange: setValue,
 * });
 *
 * <Combobox items={items} value={value} onValueChange={setValue} {...comboboxProps}>
 *   ...
 * </Combobox>
 * ```
 */
export function useAsyncCombobox<T extends { id: string }>(
  options: UseAsyncComboboxSingleOptions<T>,
): UseAsyncComboboxReturn<T>;
export function useAsyncCombobox<T extends { id: string }>(
  options: UseAsyncComboboxMultipleOptions<T>,
): UseAsyncComboboxReturn<T>;
export function useAsyncCombobox<T extends { id: string }>({
  searchFn,
  debounceMs = 0,
  multiple,
  value,
  onValueChange,
}:
  | UseAsyncComboboxSingleOptions<T>
  | UseAsyncComboboxMultipleOptions<T>): UseAsyncComboboxReturn<T> {
  const [searchResults, setSearchResults] = React.useState<T[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const query = inputValue.trim();

  // Merge search results with selected values to keep them visible
  const items = React.useMemo(() => {
    if (multiple) {
      const selectedValues = (value as T[] | undefined) ?? [];
      if (selectedValues.length === 0) {
        return searchResults;
      }
      // Add selected values that aren't already in search results
      const searchIds = new Set(searchResults.map((item) => item.id));
      const missingSelected = selectedValues.filter(
        (item) => !searchIds.has(item.id),
      );
      return [...searchResults, ...missingSelected];
    } else {
      const selectedValue = value as T | null | undefined;
      if (
        !selectedValue ||
        searchResults.some((item) => item.id === selectedValue.id)
      ) {
        return searchResults;
      }
      return [...searchResults, selectedValue];
    }
  }, [searchResults, value, multiple]);

  // Perform search
  const performSearch = React.useCallback(
    (searchQuery: string) => {
      // Cancel any previous request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      startTransition(async () => {
        setError(null);

        try {
          const results = await searchFn(searchQuery, controller.signal);

          if (controller.signal.aborted) {
            return;
          }

          startTransition(() => {
            setSearchResults(results);
          });
        } catch (err) {
          if (controller.signal.aborted) {
            return;
          }

          const message =
            err instanceof Error ? err.message : "Search failed. Try again.";
          setError(message);
          setSearchResults([]);
        }
      });
    },
    [searchFn],
  );

  // Handle input value changes
  const handleInputValueChange = React.useCallback(
    (
      nextValue: string,
      details: { reason: string; event: Event | React.SyntheticEvent },
    ) => {
      setInputValue(nextValue);

      // Don't search if input was cleared due to item selection
      if (details.reason === "item-press") {
        return;
      }

      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const trimmed = nextValue.trim();

      if (trimmed === "") {
        setSearchResults([]);
        setError(null);
        abortControllerRef.current?.abort();
        return;
      }

      // Debounce the search
      if (debounceMs > 0) {
        debounceTimerRef.current = setTimeout(() => {
          performSearch(trimmed);
        }, debounceMs);
      } else {
        performSearch(trimmed);
      }
    },
    [debounceMs, performSearch],
  );

  // Handle popup close - reset to only show selected values
  const handleOpenChangeComplete = React.useCallback(
    (open: boolean) => {
      if (!open) {
        if (multiple) {
          const selectedValues = (value as T[] | undefined) ?? [];
          setSearchResults(selectedValues);
          // Clear input for multiple selection (chips show the selections)
          setInputValue("");
        } else {
          const selectedValue = value as T | null | undefined;
          setSearchResults(selectedValue ? [selectedValue] : []);
          // Don't clear input for single selection - Base UI handles
          // displaying the selected value via itemToStringLabel
        }
        setError(null);
      }
    },
    [value, multiple],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    items,
    comboboxProps: {
      inputValue,
      onInputValueChange: handleInputValueChange,
      filter: null,
      onOpenChangeComplete: handleOpenChangeComplete,
    },
    isPending,
    error,
    query,
  };
}
