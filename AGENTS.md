# AGENTS.md

This file provides guidance to AI coding agents (OpenCode, Claude Code, etc.) when working with code in this repository.

## Project Overview

**Cubby UI** - A component library built with Next.js 15, React 19, Tailwind CSS 4, and Base UI. Uses pnpm as package manager.

## Build Commands

```bash
pnpm run dev          # Start dev server (use timeout when running)
pnpm run build        # Production build (includes registry sync)
pnpm run lint         # Run ESLint
pnpm run lint --fix   # Auto-fix lint issues
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once (CI)
pnpm run registry:sync # Sync component registry metadata
```

## Code Style Guidelines

### Formatting (Prettier)

Prettier auto-formats code. Run before committing:

- Uses `prettier-plugin-tailwindcss` for class sorting
- Let Prettier handle all formatting decisions

### TypeScript

- **Strict mode enabled** - `tsconfig.json` has `"strict": true`
- Use explicit types for function parameters and return values
- Prefer `unknown` over `any` when type is genuinely unknown
- Use `const` by default, `let` only when reassignment needed, never `var`
- Use `ReactElement` instead of `JSX.Element` for better compatibility

### Imports

Order imports as follows:

1. `"use client"` or `"use server"` directive (if needed)
2. React imports (`import * as React from "react"`)
3. External dependencies
4. Internal absolute imports (`@/...`)
5. Relative imports (`./...`)

```tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "@/lib/utils";
import { useLocalHook } from "./hooks/use-local-hook";
```

**Path aliases:**

- `@/*` → project root
- `@/registry/*` → `./registry/*`

### Naming Conventions

- **Files**: kebab-case (`button.tsx`, `use-fuzzy-filter.ts`)
- **Components**: PascalCase (`Button`, `ComponentPreview`)
- **Hooks**: camelCase with `use` prefix (`useFuzzyFilter`)
- **Variables/functions**: camelCase (`buttonVariants`, `handleClick`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants (`DEFAULT_TIMEOUT`)
- **Types/Interfaces**: PascalCase (`ButtonProps`, `ComponentMeta`)

### Component Structure

```tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Variants defined with cva
const buttonVariants = cva("base-classes", {
  variants: {
    /* ... */
  },
  defaultVariants: {
    /* ... */
  },
});

// Props type extends base + variants
export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    customProp?: string;
  };

// Named function (not arrow) for components
function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

**Key patterns:**

- Use `data-slot="component-name"` for styling hooks
- Use `cn()` from `@/lib/utils` for class merging
- Use `cva` from class-variance-authority for variants
- Export both component and variants

### React Best Practices

- Function components only (no class components)
- Hooks at top level only, never conditionally
- Specify all dependencies in hook dependency arrays
- Use `key` prop with unique IDs (not array indices)
- Don't define components inside other components

### Error Handling

- Remove `console.log`, `debugger`, `alert` from production code
- Throw `Error` objects with descriptive messages
- Use early returns over nested conditionals
- Handle promise rejections properly

### Accessibility

- Use semantic HTML (`<button>`, `<nav>`, not `<div>` with roles)
- Provide meaningful `alt` text for images
- Add labels for form inputs
- Include keyboard event handlers alongside mouse events
- Ensure interactive elements are keyboard accessible

## Directory Structure

```
registry/default/           # Source UI components
registry/default/hooks/     # Shared hooks (registry:hook)
registry/default/lib/       # Shared utilities (registry:lib)
registry/examples/          # Component examples
content/docs/               # MDX documentation
components/                 # App-specific components
lib/                        # App utilities
hooks/                      # App hooks
```

**Important:** `registry/default/hooks/` ≠ `hooks/` (root). Registry items are installable via shadcn CLI.

## Component Development Workflow

1. Add/modify components in `registry/default/[component]/`
2. Create examples in `registry/examples/[component]/`
3. Run `pnpm run registry:sync` to update metadata
4. Create/update MDX docs in `content/docs/components/`

## When Adding Hooks or Utilities

**Always add tests** when creating or modifying files in:

- `registry/default/hooks/` → add test in `tests/hooks/[hook-name].test.ts`
- `registry/default/lib/` → add test in `tests/lib/[util-name].test.ts`

Components (thin wrappers around Base UI) do not need tests.

## Key Dependencies

- **Base UI** (`@base-ui/react`) - Unstyled accessible components
- **CVA** (`class-variance-authority`) - Component variants
- **Tailwind CSS 4** - Styling with CSS variables
- **Fumadocs** - Documentation framework
- **Shiki** - Syntax highlighting

## Before Committing

1. Run `pnpm run lint` - fix any errors
2. Run `pnpm test:run` - ensure all tests pass
3. Ensure code follows patterns above
4. Run `pnpm run registry:sync` if components changed
5. Verify component examples work in dev server

## Detailed Documentation

For deeper context on specific areas, read these files:

| File                         | When to Read                                                              |
| ---------------------------- | ------------------------------------------------------------------------- |
| `REGISTRY_SYSTEM.md`         | Registry architecture, multi-file components, shared hooks/utils, imports |
| `BASE_UI_PATTERNS.md`        | Creating polymorphic components with Base UI's useRender/mergeProps       |
| `MDX_DOCUMENTATION.md`       | MDX components, server-side highlighting, search system                   |
| `CODE_STANDARDS.md`          | Comprehensive code quality rules, async patterns, security, performance   |
| `API_REFERENCE_GUIDE.md`     | Writing API reference sections in component docs                          |
| `WEB_INTERFACE_STANDARDS.md` | UI/UX guidelines, animations, touch interactions, accessibility           |
| `TESTING.md`                 | Testing conventions, Vitest setup, React Testing Library patterns         |

**Read `REGISTRY_SYSTEM.md` when:**

- Working with the component registry system
- Understanding multi-file component import patterns
- Adding shared hooks or utilities

**Read `BASE_UI_PATTERNS.md` when:**

- Creating polymorphic components with Base UI's `useRender`

**Read `MDX_DOCUMENTATION.md` when:**

- Adding/modifying MDX documentation components
- Working with the search system

**Read `TESTING.md` when:**

- Adding or modifying tests
- Understanding test conventions and patterns
