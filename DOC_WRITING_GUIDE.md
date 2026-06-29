# Docs Writing Guide

This guide defines **how a component doc page is structured and written**: the
page-level voice, the section order, and which sections to include. It is the
companion to two narrower guides:

- **`API_REFERENCE_GUIDE.md`** owns the `## API Reference` section (what props to
  document, `<ApiProp>` syntax, type/default formatting).
- **`MDX_DOCUMENTATION.md`** owns the MDX component mechanics
  (`<ComponentPreview>`, `<ComponentInstall>`, `<ComponentUsage>`, `meta.json`
  search).

When those concerns come up, defer to them rather than repeating their rules.

## The goal

Docs should read like a person who knows the component wrote them: terse,
confident, and free of filler. The fastest way to sound machine-generated is to
write sentences that state the obvious without adding information. The fastest
way to sound human is to lead with **what the component is and when to reach for
it**, then get out of the way.

## Canonical section order

```text
---
title: ...
description: ...
type: primitive | composable
builtOn: [...]        # composables only
---

import { ... } from "@/registry/default/...";

<lede paragraph>      (required, no heading)

## Preview
## Installation
## Usage
## Composition         (conditional)
## Features            (conditional)
## Examples
## Accessibility       (conditional)
## API Reference       (see API_REFERENCE_GUIDE.md)
```

Required on every page: the lede, Preview, Installation, Usage, Examples, API
Reference. Composition, Features, and Accessibility are **conditional**. See the
rules below.

## The lede (required)

One or two sentences placed immediately after the `import`, **before
`## Preview`**, with no heading. It answers two questions and, when relevant, a
third:

1. **What is it?** Name the component and what it does.
2. **When do you use it?** Concrete situations, not abstractions.
3. **What should I use instead?** *(when a sibling overlaps)*. Point to it.

Formula: `The <Component> <does X>. Use it for <concrete cases>.`

```mdx
Buttons trigger an action or event: submitting a form, opening a dialog, or
confirming a choice. Use them for in-page actions, not navigation between pages.
```

```mdx
The command menu is a searchable list of actions and links, driven entirely by
the keyboard. Use it for a ⌘K palette, a quick switcher, or any
search-then-select flow.

For a simple dropdown of options tied to a form field, use
[`Select`](/docs/components/select) instead.
```

Do not write a lede that restates the title (*"The Button component is a
button."*) or one that opens with filler (*"This component provides…"*).

## Conditional sections

Include a section only when the component earns it. A section stamped onto every
page regardless of need is the thing that makes docs feel auto-generated. **One
deliberate section is voice; the same section on every page is grammar.**

### Composition

Include when the component exposes **two or more parts**. Show an ASCII anatomy
tree so readers see the structure at a glance. Place it after `## Usage`.

````mdx
## Composition

```text
Command
├── CommandInput
├── CommandList
│   ├── CommandEmpty
│   └── CommandGroup
│       └── CommandItem
└── CommandFooter
```
````

**Skip** for single-element components (Button, Badge, Spinner, Skeleton). A
one-node tree is noise.

### Features

Include **only** when the component has non-obvious capabilities the examples
don't already make clear: an upload state machine, shimmer-while-loading, scroll
snapping, RTL awareness. A short bullet list, each item one line.

**Default: omit.** If the bullets just restate what the examples show ("multiple
variants, multiple sizes"), delete the section.

### Accessibility

Include when there is **component-specific** guidance: labeling icon-only
controls, conveying meaning beyond color, custom keyboard or focus behavior you
added on top of Base UI. Use `###` sub-sections for distinct concerns and show
the minimal code.

**Skip** when Base UI handles accessibility and there is nothing specific to add.
Never write a generic "this component is accessible" section. That's filler.

## Voice rules

### Kill filler

Every sentence must add information. Cut anything that states the obvious.

| Avoid | Prefer |
| --- | --- |
| The Button supports multiple visual variants for different use cases. | Use `variant` to change the button's visual weight and color. |
| Choose from multiple sizes to fit your design. | Use `size` to set the button's height and padding. |
| Add icons to provide visual context. | Use `leftSection` and `rightSection` to place icons beside the label. |

Banned shapes: *"for different use cases," "to fit your design," "to provide
visual context," "This component…," "This prop…," "Whether or not…"*.

### No em-dashes

Em-dashes (`—`) are a common machine-writing tell. Don't use them. Restructure
with a comma, a colon, parentheses, or two sentences:

| Avoid | Prefer |
| --- | --- |
| Use it for large lists — it only renders what's in view. | Use it for large lists; it only renders what's in view. |
| The `-soft` variants are tinted — useful for low-emphasis CTAs. | The `-soft` variants are tinted, for low-emphasis CTAs. |

### Example prose = one sentence

Each `### Example` gets a single declarative sentence above its preview that says
what the example shows and how to trigger it. Prefer the "Use `prop` to …" form.
No preamble, no second sentence unless there's a genuine caveat.

```mdx
### Sizes

Use `size` to set the button's height and padding.

<ComponentPreview component="button" example="button-sizes" />
```

### Tables for variants and enums

When an example introduces a set of variants or enum values, follow it with a
compact `value → description` table. Each description is a short phrase.

```mdx
| Variant       | Description                                  |
| ------------- | -------------------------------------------- |
| `primary`     | The default, highest-emphasis action.        |
| `outline`     | A bordered, lower-emphasis action.           |
| `destructive` | A destructive action such as delete.         |
```

### Mechanics

- Wrap prop names and values in backticks: `` `variant` ``, `` `"primary"` ``.
- Sentence-case headings (`## Examples`, not `## EXAMPLES`).
- Link related docs with relative paths: `[Select](/docs/components/select)`.

## Checklist

Before submitting a doc page:

- [ ] Lede present after the import, before `## Preview`; says what it is + when
      to use it (+ scoping note if a sibling overlaps)
- [ ] No filler sentences; every line adds information
- [ ] No em-dashes; use commas, colons, parentheses, or separate sentences
- [ ] Each example has a single declarative sentence above its preview
- [ ] Variant/enum sets are followed by a compact table
- [ ] `## Composition` present **iff** the component has 2+ parts
- [ ] `## Features` present **only** if capabilities aren't obvious from examples
- [ ] `## Accessibility` present **only** if there's component-specific guidance
- [ ] `## API Reference` follows `API_REFERENCE_GUIDE.md`
- [ ] Prop names/values in backticks; related docs linked with relative paths
