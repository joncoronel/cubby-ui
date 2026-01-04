# TESTING.md

This document covers testing conventions and patterns for Cubby UI.

## Overview

Cubby UI uses **Vitest** with **React Testing Library** for testing. Tests focus on **custom hooks and utilities** - not components, since those are thin wrappers around Base UI which is already well-tested.

## Test Commands

```bash
pnpm test        # Watch mode - re-runs on file changes
pnpm test:run    # Single run - good for CI
```

## Directory Structure

```
tests/
└── hooks/                    # Hook and utility tests
    ├── use-fuzzy-filter.test.ts
    └── use-list-virtualizer.test.ts
```

**Important:** Tests are kept separate from `registry/default/` because the registry sync script scans that directory. Placing test files there would include them in the component registry.

## Testing Stack

| Tool                        | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| `vitest`                    | Test runner                                              |
| `@testing-library/react`    | Hook rendering via `renderHook`                          |
| `@testing-library/jest-dom` | DOM matchers (`toBeDisabled`, `toBeInTheDocument`, etc.) |
| `jsdom`                     | Browser environment simulation                           |

## What to Test

### Custom Hooks

Hooks contain logic that you own entirely. Test their inputs, outputs, and edge cases.

```typescript
import { describe, it, expect } from "vitest";
import { useFuzzyFilter } from "@/registry/default/hooks/use-fuzzy-filter";

describe("useFuzzyFilter", () => {
  it("returns all items when query is empty", () => {
    const { filter } = useFuzzyFilter<Item>({ keys: ["name"] });
    const result = filter(items, "");
    expect(result).toHaveLength(3);
  });
});
```

### Utility Functions

Pure functions are the easiest to test:

```typescript
import { describe, it, expect } from "vitest";
import { someUtility } from "@/registry/default/lib/some-utility";

describe("someUtility", () => {
  it("handles normal input", () => {
    expect(someUtility("input")).toBe("expected output");
  });

  it("handles edge cases", () => {
    expect(someUtility("")).toBe("");
    expect(someUtility(null)).toBe(null);
  });
});
```

### What NOT to Test

- **Components** - They're thin wrappers around Base UI; testing them is essentially testing Base UI
- **Base UI behavior** - Base UI already tests ARIA, keyboard nav, focus management
- **Tailwind CSS classes** - Visual testing is better suited for this
- **Third-party library internals** - Trust that dependencies work

## Testing Patterns

### Type Generic Hooks

When testing generic hooks, provide the type parameter:

```typescript
interface TestItem {
  id: number;
  name: string;
}

const { filter } = useFuzzyFilter<TestItem>({ keys: ["name"] });
```

### Test Hook Return Values

For hooks that return objects with multiple methods:

```typescript
describe("useListVirtualizer", () => {
  describe("getItem", () => {
    it("returns item at virtual index", () => {
      const { result } = renderHook(() => useListVirtualizer(options));
      const item = result.current.getItem({ index: 5 });
      expect(item).toEqual({ id: 5, name: "Item 5" });
    });
  });

  describe("getItemProps", () => {
    it("returns aria-setsize based on filteredItems length", () => {
      const { result } = renderHook(() => useListVirtualizer(options));
      const props = result.current.getItemProps({ index: 0 });
      expect(props["aria-setsize"]).toBe(100);
    });
  });
});
```

### Mock Functions with `vi.fn()`

```typescript
const callback = vi.fn();
// ... use callback
expect(callback).toHaveBeenCalledTimes(1);
expect(callback).toHaveBeenCalledWith("expected arg");
```

## Test File Naming

- Hook tests: `tests/hooks/[hook-name].test.ts`
- Utility tests: `tests/utils/[utility-name].test.ts`

## Configuration Files

### `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### `vitest.setup.ts`

```typescript
import "@testing-library/jest-dom/vitest";
```

## Common Assertions

```typescript
// Equality
expect(result).toBe(expected);
expect(result).toEqual({ key: "value" });

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeUndefined();

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Objects
expect(object).toHaveProperty("key");
expect(object).toMatchObject({ key: "value" });

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith("arg");

// Types
expect(typeof result).toBe("function");
expect(Array.isArray(result)).toBe(true);
```

## Adding New Tests

1. Create test file in `tests/hooks/` or `tests/utils/`
2. Import from `@/registry/default/...` using path alias
3. Follow existing test patterns
4. Run `pnpm test` to verify
