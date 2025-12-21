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
3. **Key data props** - Essential props like `items`, `value`, `children` that are central to how the component works

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

### Component Subsections

Use H3 (`###`) for each component that has props worth documenting:

```mdx
### ComponentName

Optional description of the component's purpose.

<ApiPropsList>
  ...props...
</ApiPropsList>
```

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

## Component Parts Table

For compound components with many parts, include a Component Parts table:

```mdx
### Component Parts

| Component | Description |
| --- | --- |
| `Command` | Root component wrapping the autocomplete functionality |
| `CommandInput` | Search input with icon |
| `CommandList` | Scrollable list container with empty state |
| `CommandItem` | Individual command item |
```

Keep descriptions brief (one short sentence).

## Complete Example

```mdx
## API Reference

The Button component is built on top of [Base UI's Button](https://base-ui.com/react/components/button). All Base UI props are supported. The documentation below only covers custom props and modified defaults specific to our implementation.

For the complete Base UI API, see the [Base UI Button documentation](https://base-ui.com/react/components/button).

### Button

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

## Checklist

Before submitting documentation:

- [ ] Only props explicitly used in the component are documented
- [ ] Intro paragraph links to base library documentation
- [ ] Each prop has `name` and `fullType`
- [ ] String default values have proper quote escaping
- [ ] Descriptions are concise and start with action verbs
- [ ] Complex props have list formatting for options
- [ ] Component parts table included for compound components (if applicable)
