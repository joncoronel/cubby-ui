# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Cubby UI**, a comprehensive UI component library built with Next.js 15, React 19, and modern web technologies. It serves as both a component showcase and a reusable component registry system.

## Build Commands

- `pnpm run dev` - Start development server with Turbo (when running it, do it with a timeout)
- `pnpm run build` - Build the project (includes registry sync)
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run registry:sync` - Sync component registry (auto-runs before build)

## Architecture Overview

### Component Registry System

The project uses a sophisticated component registry system that auto-generates metadata and examples:

- **Registry Source**: `registry/default/` contains all UI components
- **Registry Output**: `registry.json` is auto-generated from source components
- **Unified Registry**: `app/components/_generated/registry.ts` provides TypeScript interfaces and component maps
- **Sync Script**: `scripts/registry-sync.ts` handles automatic registry updates

### Directory Structure

- `registry/default/` - Source UI components (Button, Card, etc.)
- `registry/examples/` - Example implementations for each component
- `content/docs/` - MDX documentation files (powered by Fumadocs)
- `app/docs/` - Documentation pages and layouts
- `components/mdx/` - MDX component wrappers for documentation
- `components/` - Application-specific components (providers, theme)
- `lib/` - Utility functions
- `hooks/` - Custom React hooks

### Key Technologies

- **Next.js 15** with App Router and React 19
- **Fumadocs** - Documentation framework with MDX support
- **Tailwind CSS 4** for styling with CSS variables
- **Base UI Components** and **React Aria Components** for accessibility
- **Shiki** - Syntax highlighting (server-side and client-side)
- **Jotai** for state management
- **Recharts** for data visualization
- **Embla Carousel** for carousel functionality
- **next-themes** for dark/light mode

### Component Structure

Components follow a consistent pattern:

- Main component file: `registry/default/[component]/[component].tsx`
- Examples: `registry/examples/[component]/[component]-*.tsx`
- Auto-generated imports and anatomy in unified registry

#### Using Base UI's useRender and mergeProps

When creating custom components that support polymorphic rendering (render prop pattern), **always** use Base UI's `useRender` and `mergeProps` utilities:

```tsx
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

interface MyComponentProps extends useRender.ComponentProps<"button"> {
  // Add your custom props here (NOT the render prop - it's included automatically)
  variant?: "default" | "ghost";
}

function MyComponent({ className, render, ...props }: MyComponentProps) {
  const defaultProps = {
    className: cn("my-styles", className),
    "data-slot": "my-component",
    // ...other default props
  };

  const element = useRender({
    defaultTagName: 'button', // Required: specify the default HTML element
    render: render,           // Pass render prop directly (no fallback needed)
    props: mergeProps<'button'>(defaultProps, props), // Merge with type parameter
  });

  return element;
}
```

**Key Rules:**

- Use `useRender.ComponentProps<'tagname'>` instead of `React.ComponentProps<'tagname'>` - this automatically includes the properly-typed `render` prop
- Do NOT manually add `render?: React.ReactElement | ...` to your interface - it's included via `useRender.ComponentProps`
- Always include `defaultTagName` parameter in `useRender()` (required)
- Pass `render` prop directly without fallback (`render || <button />` is incorrect)
- Use type parameter in `mergeProps<'tagname'>()` matching your defaultTagName
- For components wrapping with Context or other elements, assign `useRender` result to a variable first
- This pattern ensures proper prop merging, ref forwarding, and polymorphic rendering

### Styling Approach

- Uses Tailwind CSS with design tokens
- CSS variables for theming (light/dark mode)
- Class variance authority for component variants
- Geist fonts (Sans and Mono) as default typography

### Documentation System (Fumadocs + MDX)

The project uses **Fumadocs** for documentation with auto-syncing MDX components:

#### MDX Component Structure

Documentation files live in `content/docs/components/` and use special MDX components that automatically sync with the registry:

**ComponentPreview** - Shows interactive component preview with code tab
```mdx
<ComponentPreview component="button" example="button-demo">
  <ButtonDemo />
</ComponentPreview>
```

**ComponentInstall** - Auto-generates installation instructions
```mdx
<ComponentInstall component="button" />
```
- Automatically pulls dependencies from registry metadata
- Shows CLI and Manual installation tabs
- Manual tab includes package manager selection (npm/pnpm/yarn/bun)
- Component source code is auto-fetched from `registry/default/`

**ComponentUsage** - Auto-generates usage examples
```mdx
<ComponentUsage component="button" />
```
- Shows two code blocks: imports and component anatomy
- Imports are extracted from component metadata
- Anatomy shows the basic JSX structure without function wrapper

#### Server-Side Highlighting

All code blocks are pre-highlighted on the server using Shiki for optimal performance:
- `ComponentPreviewServer` wraps `ComponentPreview` (sync wrapper with async code provider)
- `ComponentInstallServer` pre-highlights all installation commands
- `ComponentUsageServer` pre-highlights imports and anatomy separately

**Important**: `ComponentPreviewServer` must be synchronous to avoid ref serialization issues with client components passed as children. Async highlighting is delegated to a separate `HighlightedCodeProvider` component.

#### MDX Components Location

- `components/mdx/component-preview-server.tsx` - Server wrapper (sync)
- `components/mdx/component-preview.tsx` - Client component with tabs
- `components/mdx/component-install-server.tsx` - Server wrapper (async)
- `components/mdx/component-install.tsx` - Client component with package manager tabs
- `components/mdx/component-usage-server.tsx` - Server wrapper (async)
- `components/mdx/component-usage.tsx` - Client component with two code blocks
- `mdx-components.tsx` - Exports all MDX components for use in documentation

### Development Workflow

1. Add/modify components in `registry/default/`
2. Create examples in `registry/examples/`
3. Run `pnpm run registry:sync` to update metadata
4. Create/update MDX documentation in `content/docs/components/`
5. Use `ComponentPreview`, `ComponentInstall`, and `ComponentUsage` components
6. The build process automatically syncs registry before building

### Package Management

- Uses **pnpm** as package manager
- Special handling for esbuild and @tailwindcss/oxide in pnpm config
- Built dependencies optimization enabled

## Code Quality & Interface Standards

This project follows strict quality standards for both code and user interface design.

### Code Standards

See [CODE_STANDARDS.md](./CODE_STANDARDS.md) for comprehensive code quality guidelines enforced by ESLint and Prettier.

### API Reference Documentation

See [API_REFERENCE_GUIDE.md](./API_REFERENCE_GUIDE.md) for how to write API reference sections in component documentation.

**When writing or updating component documentation:**

1. Only document props explicitly used in the component (custom props, modified defaults, key data props)
2. Do not list all props from the base library - link to their docs instead
3. Use `<ApiPropsList>` and `<ApiProp>` components for consistent formatting
4. Add a brief description for each component part explaining what it does

**After writing or modifying code:**
1. Run `pnpm run format` to auto-format with Prettier
2. Run `pnpm run lint` to check for ESLint issues
3. Fix any lint errors (use `--fix` flag for auto-fixable issues)
4. Verify your code follows the standards in CODE_STANDARDS.md

Key principles:
- Write accessible, performant, type-safe, and maintainable code
- Use explicit types and modern JavaScript/TypeScript patterns
- Follow React best practices (hooks rules, proper component structure)
- Ensure accessibility with semantic HTML and ARIA attributes
- Handle errors properly and remove debug statements
- Prefer clarity and explicit intent over brevity

### Web Interface Standards

See [WEB_INTERFACE_STANDARDS.md](./WEB_INTERFACE_STANDARDS.md) for comprehensive UI/UX guidelines.

**When building or modifying UI components, interactions, or user-facing features:**
1. Review relevant sections in WEB_INTERFACE_STANDARDS.md before implementation
2. Apply appropriate guidelines for the interaction type (forms, buttons, animations, etc.)
3. Test interactivity, especially for touch devices and keyboard navigation
4. Verify accessibility with screen readers and keyboard-only navigation
5. Check motion and animation durations (≤200ms for interactions)
6. Ensure proper focus management and ARIA labels

Key areas to check:
- **Interactivity**: Form submissions, input labels, button states, focus management
- **Typography**: Font smoothing, weights, fluid sizing, tabular numbers
- **Motion**: Animation durations, theme switching, scroll behavior, respect for reduced motion
- **Touch**: Hover states, input sizing, auto-focus behavior, touch gestures
- **Accessibility**: Focus rings, keyboard navigation, ARIA labels, screen reader support
- **Optimizations**: GPU usage, performance, lazy loading, adaptive experiences
- **Design**: Empty states, error feedback, loading states, optimistic updates

## Important Notes

- Registry sync script auto-generates component metadata and validates consistency
- Component anatomy is extracted from basic examples using TypeScript AST parsing
- The unified registry provides both runtime and build-time access to component data
- Always run registry sync after adding/modifying components
- **Documentation auto-syncs**: When you edit components or examples, the MDX documentation automatically reflects changes on next build (no manual code updates needed)
- **Server component patterns**: Use synchronous server components when passing children with refs to avoid serialization errors
- **Type safety**: Always use `ReactElement` instead of `JSX.Element` for better TypeScript compatibility across configurations
