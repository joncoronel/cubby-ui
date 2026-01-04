# MDX Documentation System

This document describes the Fumadocs-based documentation system used in Cubby UI.

## Overview

The project uses **Fumadocs** for documentation with auto-syncing MDX components. Documentation files live in `content/docs/components/` and use special MDX components that automatically sync with the registry.

## MDX Components

### ComponentPreview

Shows interactive component preview with code tab:

```mdx
<ComponentPreview component="button" example="button-demo">
  <ButtonDemo />
</ComponentPreview>
```

### ComponentInstall

Auto-generates installation instructions:

```mdx
<ComponentInstall component="button" />
```

Features:

- Automatically pulls dependencies from registry metadata
- Shows CLI and Manual installation tabs
- Manual tab includes package manager selection (npm/pnpm/yarn/bun)
- Component source code is auto-fetched from `registry/default/`

### ComponentUsage

Auto-generates usage examples:

```mdx
<ComponentUsage component="button" />
```

Features:

- Shows two code blocks: imports and component anatomy
- Imports are extracted from component metadata
- Anatomy shows the basic JSX structure without function wrapper

### PackageManagerCommand

Shows CLI commands with package manager tabs:

```mdx
<PackageManagerCommand command="shadcn@latest add @cubby-ui/button" />
<PackageManagerCommand command="react" type="add" />
```

Props:

- `command`: The base command without package manager prefix
- `type`: Optional, either `"run"` (default) or `"add"`
  - `type="run"`: Generates `npx` / `pnpm dlx` / `bunx` commands
  - `type="add"`: Generates `npm install` / `pnpm add` / `yarn add` / `bun add` commands

Use instead of plain code fences for installation commands.

### Markdown Code Fences

Automatically rendered with custom CodeBlock. All markdown code fences use our `MdxPreServer` component with server-side Shiki highlighting and our styled CodeBlock with copy button.

## Server-Side Highlighting

All code blocks are pre-highlighted on the server using Shiki for optimal performance:

| Component                | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `ComponentPreviewServer` | Wraps `ComponentPreview` (sync wrapper with async code provider) |
| `ComponentInstallServer` | Pre-highlights all installation commands                         |
| `ComponentUsageServer`   | Pre-highlights imports and anatomy separately                    |

**Important**: `ComponentPreviewServer` must be synchronous to avoid ref serialization issues with client components passed as children. Async highlighting is delegated to a separate `HighlightedCodeProvider` component.

## MDX Components Location

```
components/mdx/component-preview-server.tsx   # Server wrapper (sync)
components/mdx/component-preview.tsx          # Client component with tabs
components/mdx/component-install-server.tsx   # Server wrapper (async)
components/mdx/component-install.tsx          # Client component with package manager tabs
components/mdx/component-usage-server.tsx     # Server wrapper (async)
components/mdx/component-usage.tsx            # Client component with two code blocks
mdx-components.tsx                            # Exports all MDX components for use in documentation
```

## Search System

The documentation search uses **Orama** with static indexing:

- **Search client**: `components/search.tsx` - Custom search dialog using static Orama search
- **Search server**: `app/api/search/route.ts` - Generates static search index at build time

### Search Filtering by meta.json

Only pages listed in their section's `meta.json` file are searchable. This allows work-in-progress pages to exist without appearing in search results.

| File                                     | Controls                                   |
| ---------------------------------------- | ------------------------------------------ |
| `content/docs/components/meta.json`      | Which components are searchable            |
| `content/docs/hooks/meta.json`           | Which hooks are searchable                 |
| `content/docs/utils/meta.json`           | Which utilities are searchable             |
| `content/docs/getting-started/meta.json` | Which getting-started pages are searchable |

**To hide a page from search:** Remove it from the `pages` array in the appropriate `meta.json` file. The page will still be accessible by URL but won't appear in search results.

**To make a page searchable:** Add the page slug to the `pages` array in the appropriate `meta.json` file and rebuild.

## Server Component Patterns

Use synchronous server components when passing children with refs to avoid serialization errors. This is why `ComponentPreviewServer` is synchronous while delegating async work to a separate provider component.
