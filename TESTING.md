# TESTING.md

This document covers testing conventions and patterns for Cubby UI.

## Overview

Cubby UI uses **Vitest** with **React Testing Library** for testing. Tests are located in a separate `tests/` directory (not co-located with components) to avoid polluting the registry.

## Test Commands

```bash
pnpm test        # Watch mode - re-runs on file changes
pnpm test:run    # Single run - good for CI
```

## Directory Structure

```
tests/
├── hooks/                    # Hook tests
│   └── use-fuzzy-filter.test.ts
└── components/               # Component tests
    └── button.test.tsx
```

**Important:** Tests are kept separate from `registry/default/` because the registry sync script scans that directory. Placing test files there would include them in the component registry.

## Testing Stack

| Tool                          | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `vitest`                      | Test runner                                              |
| `@testing-library/react`      | Component rendering and queries                          |
| `@testing-library/jest-dom`   | DOM matchers (`toBeDisabled`, `toBeInTheDocument`, etc.) |
| `@testing-library/user-event` | User interaction simulation                              |
| `jsdom`                       | Browser environment simulation                           |

## What to Test

### Priority 1: Hooks

Hooks contain pure logic that you own entirely. They're the easiest to test.

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

### Priority 2: Component Composition/Wiring

Test that your components render correctly, handle props, and respond to interactions.

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/registry/default/button/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Priority 3: Variant Application

Verify CVA variants apply correctly.

```tsx
it("applies variant data attribute", () => {
  render(<Button variant="destructive">Delete</Button>);
  expect(screen.getByRole("button")).toHaveAttribute(
    "data-variant",
    "destructive",
  );
});
```

### What NOT to Test Extensively

- **Base UI accessibility** - Base UI already tests ARIA, keyboard nav, focus management
- **Tailwind CSS classes** - Visual testing is better suited for this
- **Third-party library internals** - Trust that dependencies work

## Testing Patterns

### Use Role Queries

Prefer `getByRole` over `getByTestId` - it mirrors how users find elements:

```tsx
// Good - queries by accessibility role
screen.getByRole("button", { name: /submit/i });

// Avoid when possible - implementation detail
screen.getByTestId("submit-button");
```

### Use `userEvent` Over `fireEvent`

`userEvent` simulates real user interactions more accurately:

```tsx
// Good - simulates real click (focus, mousedown, mouseup, click)
await userEvent.click(button);

// Less realistic
fireEvent.click(button);
```

### Mock Functions with `vi.fn()`

```tsx
const handleClick = vi.fn();
render(<Button onClick={handleClick}>Click</Button>);
await userEvent.click(screen.getByRole("button"));
expect(handleClick).toHaveBeenCalledTimes(1);
```

### Type Generic Hooks

When testing generic hooks, provide the type parameter:

```typescript
interface TestItem {
  id: number;
  name: string;
}

const { filter } = useFuzzyFilter<TestItem>({ keys: ["name"] });
```

## Test File Naming

- Hook tests: `tests/hooks/[hook-name].test.ts`
- Component tests: `tests/components/[component-name].test.tsx`

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

```tsx
// Element presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Disabled state
expect(button).toBeDisabled();
expect(button).not.toBeDisabled();

// Attributes
expect(button).toHaveAttribute("data-variant", "primary");
expect(button).toHaveAttribute("aria-disabled", "true");

// Classes
expect(button).toHaveClass("custom-class");

// Text content
expect(element).toHaveTextContent("Hello");

// Function calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith("arg");
```

## Base UI Behavior Notes

Base UI components have specific behaviors to be aware of when testing:

### `focusableWhenDisabled`

When a Button has `loading={true}`, it uses `aria-disabled="true"` with `tabindex="0"` instead of the native `disabled` attribute. This keeps the button focusable for accessibility:

```tsx
it("is aria-disabled but focusable when loading", () => {
  render(<Button loading>Loading</Button>);
  const button = screen.getByRole("button");
  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).toHaveAttribute("tabindex", "0");
});
```

## Adding New Tests

1. Create test file in appropriate directory (`tests/hooks/` or `tests/components/`)
2. Import from `@/registry/default/...` using path alias
3. Follow existing test patterns
4. Run `pnpm test` to verify
