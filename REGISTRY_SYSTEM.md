# Registry System

This document describes the component registry architecture, directory structure, and import patterns used in Cubby UI.

## Component Registry System

The project uses a sophisticated component registry system that auto-generates metadata and examples:

- **Registry Source**: `registry/default/` contains all UI components
- **Registry Output**: `registry.json` is auto-generated from source components
- **Unified Registry**: `app/components/_generated/registry.ts` provides TypeScript interfaces and component maps
- **Sync Script**: `scripts/registry-sync.ts` handles automatic registry updates

## Directory Structure

```
registry/default/                    # Source UI components (Button, Card, etc.)
  registry/default/[component]/      # Individual component directories
  registry/default/hooks/            # Shared React hooks (registry:hook)
  registry/default/lib/              # Shared utility functions (registry:lib)
registry/examples/                   # Example implementations for each component
content/docs/                        # MDX documentation files (powered by Fumadocs)
app/docs/                            # Documentation pages and layouts
components/mdx/                      # MDX component wrappers for documentation
components/                          # Application-specific components (providers, theme)
lib/                                 # Application utility functions
hooks/                               # Application React hooks
```

## Component Structure

Components follow a consistent pattern:

- Main component file: `registry/default/[component]/[component].tsx`
- Examples: `registry/examples/[component]/[component]-*.tsx`
- Auto-generated imports and anatomy in unified registry

## Shared Hooks and Utilities

Reusable code shared across multiple components lives in dedicated directories:

- **Shared hooks**: `registry/default/hooks/` (e.g., `use-fuzzy-filter.ts`, `use-list-virtualizer.ts`)
- **Shared utilities**: `registry/default/lib/` (e.g., `highlight-text.tsx`)

These are registered as **standalone registry items** (`registry:hook` or `registry:lib`) with their own documentation pages:

- **Hook docs**: `content/docs/hooks/` (e.g., `/docs/hooks/use-fuzzy-filter`)
- **Utility docs**: `content/docs/utils/` (e.g., `/docs/utils/highlight-text`)

### Important Distinctions

| Path                                  | Purpose                   | Installation             |
| ------------------------------------- | ------------------------- | ------------------------ |
| `registry/default/hooks/`             | Shared registry items     | Installed via shadcn CLI |
| `registry/default/lib/`               | Shared registry items     | Installed via shadcn CLI |
| `hooks/` (root level)                 | Application-specific code | Not part of registry     |
| `lib/` (root level)                   | Application-specific code | Not part of registry     |
| `registry/default/[component]/hooks/` | Component-specific hooks  | Bundled with component   |

### Usage Pattern

- Components do NOT re-export hooks/utils - they are standalone items
- Examples import directly from the hook/util paths:

```tsx
import { useFuzzyFilter } from "@/registry/default/hooks/use-fuzzy-filter";
import { highlightText } from "@/registry/default/lib/highlight-text";
```

- Component docs link to dedicated hook/util docs instead of duplicating documentation
- Users install hooks/utils separately when needed via `npx shadcn@latest add @cubby-ui/use-fuzzy-filter`

## Multi-File Component Structure

Multi-file components (with internal hooks/lib directories) use **relative imports** for internal files. These components are installed as co-located directories:

```text
# Source structure
registry/default/drawer/
├── drawer.tsx
├── drawer.css
├── hooks/
│   ├── use-scroll-snap.ts
│   └── use-virtual-keyboard.ts
└── lib/
    └── drawer-utils.ts

# Installed structure (via shadcn CLI)
components/ui/cubby-ui/drawer/
├── drawer.tsx
├── drawer.css
├── hooks/
│   ├── use-scroll-snap.ts
│   └── use-virtual-keyboard.ts
└── lib/
    └── drawer-utils.ts
```

### Import Patterns

```tsx
// ✅ Internal files use relative imports (no transformation needed)
// In drawer.tsx:
import { useScrollSnap } from "./hooks/use-scroll-snap";
import { DIRECTION_CONFIG } from "./lib/drawer-utils";

// In hooks/use-scroll-snap.ts:
import type { DrawerDirection } from "../lib/drawer-utils";

// ✅ External dependencies use absolute paths (transformed by CLI)
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
```

### Single-File vs Multi-File Components

**Single-file components** remain flat files:

- Source: `registry/default/button/button.tsx`
- Installed: `components/ui/cubby-ui/button.tsx`

**Multi-file components** maintain directory structure:

- Source: `registry/default/drawer/` (directory)
- Installed: `components/ui/cubby-ui/drawer/` (directory)

### Shared Registry Items Installation

Shared hooks and utilities from `registry/default/hooks/` and `registry/default/lib/` are installed to distributed locations:

- `hooks/cubby-ui/use-fuzzy-filter.ts`
- `lib/cubby-ui/highlight-text.tsx`

## Development Workflow

1. Add/modify components in `registry/default/`
2. Create examples in `registry/examples/`
3. Run `pnpm run registry:sync` to update metadata in `registry.json`
4. Run `pnpm run registry:build` to generate individual component JSON files in `public/r/`
5. Create/update MDX documentation in `content/docs/components/`
6. The build process automatically syncs registry before building

### Registry Sync vs Registry Build

| Command                   | Purpose                                                     | Output                    |
| ------------------------- | ----------------------------------------------------------- | ------------------------- |
| `pnpm run registry:sync`  | Scans source files, extracts metadata, detects dependencies | Updates `registry.json`   |
| `pnpm run registry:build` | Runs `shadcn build` to generate installable component files | Creates `public/r/*.json` |

**Both commands are required** when modifying components:

- `registry:sync` updates the source of truth (`registry.json`) with detected imports and dependencies
- `registry:build` generates the individual JSON files that the shadcn CLI uses for installation

If you only run `registry:sync`, the `public/r/*.json` files won't reflect your changes.

## Important Notes

- Registry sync script auto-generates component metadata and validates consistency
- Component anatomy is extracted from basic examples using TypeScript AST parsing
- The unified registry provides both runtime and build-time access to component data
- Always run `pnpm run registry:sync` after adding/modifying components
- Documentation auto-syncs: When you edit components or examples, the MDX documentation automatically reflects changes on next build
