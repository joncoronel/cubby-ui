# API Reference Documentation Guide

This guide explains how to write API reference sections for component documentation in Cubby UI.

## Overview

Each component's MDX documentation includes an API Reference section that documents props. We use custom MDX components (`<ApiPropsList>` and `<ApiProp>`) to render prop documentation consistently.

## What to Document

### Core Principle

**Only document props that are explicitly used within the component implementation.** Do not list all props from the underlying library (Base UI, React Aria, etc.).

Props to document include:

1. **Custom props** - Props we created that don't exist in the base library
2. **Modified defaults** - Base library props where we've changed the default value
3. **Explicitly exposed props** - Base library props that we destructure and explicitly use in our component code (not just passed through via `...props`)
4. **Key data props** - Essential props like `items`, `value`, `children` that are central to how the component works

The key distinction is whether a prop is **explicitly handled in our code** vs just passed through. If we destructure it and use it, document it. If it just flows through `...props`, don't list it—users can find it in the Base UI docs.

### What NOT to Document

- Props that pass through unchanged via `...props`
- Every possible prop from the base library (link to their docs instead)
- Standard React props like `className`, `style`, `ref` (unless they have special behavior)

## API Reference Structure

### Section Header

Start with an intro paragraph that:

1. States what the component is built on
2. Notes that all base library props are supported
3. Links to the base library documentation

```mdx
## API Reference

The [Component] is built on top of [Base UI's Component](https://base-ui.com/react/components/component). All Base UI props are supported. The documentation below only covers custom props and modified defaults specific to our implementation.

For the complete Base UI API, see the [Base UI Component documentation](https://base-ui.com/react/components/component).
```

### Props Section

Use `### Props` to contain all component prop documentation. Each component part gets a `####` heading:

```mdx
### Props

#### ComponentName

<ApiPropsList>
  ...props...
</ApiPropsList>

#### AnotherComponent

<ApiPropsList>
  ...props...
</ApiPropsList>
```

### Component Descriptions

Each component part should have a brief description explaining what it does, followed by which Base UI component(s) it wraps. The description helps users understand the component's purpose at a glance.

#### Simple Wrappers

When a component part wraps a single Base UI component:

```mdx
#### CommandList

Scrollable container for command items. Wraps Base UI's `Autocomplete.List`.

<ApiPropsList>
  ...props...
</ApiPropsList>
```

#### Compound Wrappers

When a component part composes multiple Base UI components internally (e.g., combining Portal, Backdrop, and Popup), state:

1. What the component does
2. Which Base UI components are composed
3. Which component receives the `...props`

```mdx
#### DialogContent

Main dialog container with backdrop and positioning. Composes `Dialog.Portal`, `Dialog.Backdrop`, and `Dialog.Popup`. Props are forwarded to `Dialog.Popup`.

<ApiPropsList>
  ...props...
</ApiPropsList>
```

This helps users understand:

- What the component does
- What Base UI props are available (from the component receiving `...props`)
- The internal structure (for debugging or advanced customization)

### Omitting Components

For simple wrappers without props worth documenting, you can either:

- Omit them from the Props section entirely, or
- Include them briefly to show the Base UI mapping

## ApiProp Component Usage

### Basic Syntax

```mdx
<ApiProp name="propName" fullType="string" defaultValue='"default"'>
  Description of what the prop does.
</ApiProp>
```

### Props for ApiProp

| Prop | Required | Description |
|------|----------|-------------|
| `name` | Yes | The prop name exactly as used in code |
| `fullType` | Yes | The complete TypeScript type |
| `simpleType` | No | A simplified type for display (e.g., "string", "node", "function") |
| `defaultValue` | No | The default value, wrapped in quotes if it's a string |

### Type Formatting

Use proper TypeScript syntax for `fullType`:

```mdx
<!-- String literals -->
fullType='"primary" | "secondary" | "ghost"'

<!-- Boolean -->
fullType="boolean"

<!-- Union types -->
fullType='boolean | "always"'

<!-- Complex types -->
fullType="boolean | 'top' | 'bottom' | 'x' | 'y' | FadeEdge[]"

<!-- Functions -->
fullType="(value: string) => void"

<!-- Generic types -->
fullType="T[] | { items: T[] }[]"

<!-- ReactNode -->
fullType="ReactNode"
```

### Default Value Formatting

```mdx
<!-- String defaults need inner quotes -->
defaultValue='"primary"'

<!-- Boolean/number defaults -->
defaultValue="false"
defaultValue="0"

<!-- No default (optional prop) -->
<!-- Simply omit the defaultValue prop -->
```

### Description Best Practices

1. Start with what the prop does, not "This prop..."
2. Be concise - one to two sentences is usually enough
3. Mention constraints or relationships with other props
4. Use backticks for code references within descriptions
5. Only add "Custom prop not available in Base UI" when needed to distinguish from Base UI props on a component that wraps Base UI. Skip it for entirely custom components (like Tree, Card) where the intro already explains all props are custom

```mdx
<!-- Good -->
<ApiProp name="fadeEdges" fullType="boolean" defaultValue="false">
  Adds a subtle fade effect at scroll edges using CSS masks.
</ApiProp>

<!-- Good - with additional context -->
<ApiProp name="hideScrollbar" fullType="boolean" defaultValue="false">
  Hides the scrollbar while keeping scroll functionality. Cannot be used with `persistScrollbar`.
</ApiProp>

<!-- Avoid -->
<ApiProp name="fadeEdges" fullType="boolean" defaultValue="false">
  This prop controls whether fade edges are shown.
</ApiProp>
```

### Multi-line Descriptions

For complex props, use line breaks and lists:

```mdx
<ApiProp name="fadeEdges" fullType="boolean | 'top' | 'bottom' | 'x' | 'y' | FadeEdge[]" defaultValue="false">
  Adds a subtle fade effect at the scroll edges using CSS masks.

  - `true` - fade all edges
  - `"y"` - fade top and bottom
  - `"x"` - fade left and right
  - `"top"`, `"bottom"`, `"left"`, `"right"` - fade specific edge
  - `["top", "left"]` - fade multiple specific edges
</ApiProp>
```

## Documenting Modified Defaults

When your component changes default values from the base library, **include the prop in the `<ApiPropsList>`** and note the Base UI default in the description. This ensures users can see it as an actual prop they can configure.

```mdx
<ApiProp name="autoHighlight" fullType='boolean | "always"' defaultValue='"always"'>
  Whether the first matching item is highlighted automatically. Base UI defaults to `false`.
</ApiProp>

<ApiProp name="open" fullType="boolean" defaultValue="true">
  Keeps the list always open for command menu behavior. Base UI defaults to `false`.
</ApiProp>
```

This approach:

1. Shows the prop in the API reference so users know it exists
2. Documents our default value via `defaultValue`
3. Notes the Base UI default so users understand the difference
4. Helps users revert to Base UI defaults if needed

## Notes Section

Use `### Notes` for additional information about component parts that don't have props to document but need usage guidance. This is useful for:

- Components used with the `render` prop pattern
- Usage patterns that aren't obvious from props alone
- Important caveats or tips

````mdx
### Notes

#### AlertDialogClose

Use `AlertDialogClose` with the `render` prop to create action buttons that close the dialog. Wraps Base UI's `AlertDialog.Close`.

```tsx
<AlertDialogFooter>
  <AlertDialogClose render={<Button variant="outline">Cancel</Button>} />
  <AlertDialogClose render={<Button variant="destructive">Delete</Button>} />
</AlertDialogFooter>
```
````

Markdown code fences are automatically rendered using our custom CodeBlock component with server-side syntax highlighting.

## Complete Example

```mdx
## API Reference

The Button component is built on top of [Base UI's Button](https://base-ui.com/react/components/button). All Base UI props are supported. The documentation below only covers custom props and modified defaults specific to our implementation.

For the complete Base UI API, see the [Base UI Button documentation](https://base-ui.com/react/components/button).

### Props

#### Button

Clickable element that triggers actions. Wraps Base UI's `Button`.

<ApiPropsList>

<ApiProp
  name="variant"
  fullType='"primary" | "secondary" | "outline" | "ghost" | "link" | "destructive"'
  simpleType="string"
  defaultValue='"primary"'
>
  Visual style variant of the button.
</ApiProp>

<ApiProp
  name="size"
  fullType='"xs" | "sm" | "default" | "lg" | "icon"'
  simpleType="string"
  defaultValue='"default"'
>
  Size of the button. Use `"icon"` for icon-only buttons with square dimensions.
</ApiProp>

<ApiProp name="loading" fullType="boolean" defaultValue="false">
  Display loading state with spinner. Automatically disables the button.
</ApiProp>

<ApiProp name="leftSection" fullType="ReactNode" simpleType="node">
  Content (typically icon) to display before the button text.
</ApiProp>

</ApiPropsList>
```

## Documenting Utilities and Hooks

Shared hooks and utilities have their own dedicated documentation pages in `/docs/hooks/` and `/docs/utils/`. Component documentation should **link to these dedicated pages** rather than duplicating the full API documentation.

### In Component Documentation

Use `### Utilities` and `### Hooks` sections with brief descriptions and links:

````mdx
### Utilities

#### highlightText

Highlights matching portions of text by wrapping them in `<mark>` tags. Useful for showing which parts of a suggestion match the user's input.

See [highlightText](/docs/utils/highlight-text) for full documentation and API reference.

### Hooks

#### useFuzzyFilter

Provides fuzzy matching capabilities for flexible searching across multiple fields. Returns filter functions compatible with Base UI's Autocomplete.

See [useFuzzyFilter](/docs/hooks/use-fuzzy-filter) for full documentation and API reference.
````

### In Dedicated Hook/Utility Pages

The full API documentation lives in `content/docs/hooks/` and `content/docs/utils/`. These pages should include:

1. **Installation** - `<ComponentInstall>` for CLI and manual installation options
2. **Overview** - Brief description of what it does
3. **Usage** - Code examples showing common use cases
4. **API Reference** - Full documentation using `<ApiPropsList>` and `<ApiProp>`

Example structure for a hook page:

````mdx
---
title: useFuzzyFilter
description: Fuzzy search filtering hook using match-sorter
---

## Installation

<ComponentInstall component="use-fuzzy-filter" />

## Overview

`useFuzzyFilter` provides fuzzy matching capabilities using [match-sorter](https://github.com/kentcdodds/match-sorter).

## Usage

```tsx
import { useFuzzyFilter } from "@/hooks/cubby-ui/use-fuzzy-filter";

const { filterItem } = useFuzzyFilter({
  keys: ["label", "description"],
});
```

## API Reference

### Options

<ApiPropsList>

<ApiProp name="keys" fullType='Array<string | { key: string; threshold?: FuzzyThreshold }>'>
  Properties to search on. Can specify per-key thresholds.
</ApiProp>

</ApiPropsList>

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `filter` | `(items: T[], query: string) => T[]` | Filters and sorts items by relevance |
| `filterItem` | `(item: T, query: string) => boolean` | Checks if a single item matches |
````

### Component-Specific Hooks

Some hooks are specific to a single component (like `useCommandFilter` which just aliases Base UI's filter). These should be documented inline in the component docs since they're not standalone registry items.

## Checklist

Before submitting documentation:

**Component Props:**

- [ ] Only props explicitly used in the component are documented
- [ ] Intro paragraph links to base library documentation
- [ ] Uses `### Props` with `#### ComponentName` headings for each component part
- [ ] Each component part has a brief description of what it does
- [ ] Simple wrappers state which Base UI component they wrap
- [ ] Compound wrappers state which components are composed and where `...props` go
- [ ] Each prop has `name` and `fullType`
- [ ] String default values have proper quote escaping
- [ ] Descriptions are concise and start with action verbs
- [ ] Complex props have list formatting for options
- [ ] Modified defaults are in `<ApiPropsList>` with Base UI default noted in description
- [ ] Uses `### Notes` for usage patterns without props (e.g., render prop examples)

**Hooks and Utilities:**

- [ ] Shared hooks/utils have dedicated pages in `content/docs/hooks/` or `content/docs/utils/`
- [ ] Component docs link to dedicated pages (not inline full documentation)
- [ ] Dedicated pages include: Installation, Overview, Usage, and API Reference sections
- [ ] Component-specific hooks (not standalone registry items) are documented inline
