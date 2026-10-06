# Component Ideas

Brainstorm backlog for new components. Not committed work; promote an idea to `TODO.md` once it's picked up.

Goal: components that are clever and genuinely useful, ideally composing existing primitives (Base UI wrappers) and original pieces already in the registry.

## Round 2: original interaction patterns (preferred direction)

Patterns that usually get hand-built inside products but rarely ship in component libraries.

### Novel interactions

#### Allocation Bar

One bar split into colored segments that always sum to 100%. Drag the divider between two segments to trade value between them; type an exact value into a segment and the rest rebalance proportionally; lock segments so they don't move.

- **Use cases:** budget splits, portfolio weights, scoring weights, A/B traffic splits, team capacity.
- **Composes:** `resizable` divider-drag logic, `number-field`, `tooltip`, `toggle` (lock).
- **The clever part:** one shared constraint instead of N sliders that ignore each other.

#### Sentence Form ("mad-libs" input)

A form written as a sentence with fields living inline: _"Notify me when **[price ▾]** drops below **[$50]** within **[3 days ▾]**."_ Each blank is a compact inline `select` / `number-field` / `combobox` that sizes to its content; the sentence reflows smoothly as values change.

- **Use cases:** automation rules, alerts, filters, recurrence ("every **[2nd]** **[Tuesday]**").
- **Composes:** inline variants of `select`, `number-field`, `combobox`.
- **The clever part:** very readable, and most libraries don't offer inline field variants at all.

#### Hint Mode

Hold a key (e.g. `⌥`) and every actionable element on the page shows a `kbd` badge; press the letter to trigger it (Vimium / Linear style). Components opt in via a hook; badges are anchor-positioned and pop in with a stagger.

- **Composes:** `kbd`, `command`, a new registry hook.
- **The clever part:** shortcut discoverability for an entire app at once.

#### Scrub Label

Press a field's _label_ and drag horizontally to change the number (Figma / Blender). Shift = coarse, Alt = fine, pointer lock so dragging past the screen edge keeps going. Wraps `number-field`.

- **The clever part:** tiny surface area, big power-user payoff.

### Motion showpiece

#### Morph Surface

A button that physically becomes its popover/panel: the trigger's shape expands into the content area (Dynamic Island / Family wallet style) instead of a separate pop-in.

- **Composes:** `popover`, `use-animated-height`, `transition-panel`.

### Domain-specific but practical

#### Histogram Range Slider

Dual-thumb range slider with the data's distribution drawn as bars behind it (Airbnb price filter). Bars inside the range light up; live result count ("142 results"). Plugs into `filters`.

#### Time Zone Planner

Rows of people (`avatar`) with their working hours as bars on a shared 24h axis. Drag a cursor to find overlap; off-hours dim and the best windows glow. Uses `date-utils`.

#### Inline Undo

Deleting a list/table row folds it in place into a thin "Deleted · Undo" strip with a draining countdown, instead of a toast. Undo stays where your eyes already are.

#### Smart Paste Fieldset

Paste a whole address, contact card, or spreadsheet row into any field; it distributes across the sibling fields of the `fieldset`, each field flashing as it fills.

### Top picks

1. **Allocation Bar** or **Sentence Form**: most original while still practical, both built from existing primitives.
2. **Morph Surface** if the priority is a motion showpiece.

## Round 1: gap-fillers (passed on as not original enough)

Kept for reference. These fill real gaps in the library but exist in other libraries.

- **Natural Language Date Input:** type "next fri 3pm", see the parsed result live, with a calendar popover preview. Reuses `lib/parse-date.ts`, `calendar`, `popover`, `text-morph`.
- **Dropzone / File Upload:** `marching-border` on drag-over, per-file `progress`, retry/remove, clipboard paste.
- **Hold-to-Confirm Button:** press and hold for destructive actions; fill sweeps across, springs back on early release.
- **Mention / Rich Textarea:** `@` or `/` opens a caret-anchored `autocomplete` with `use-fuzzy-filter` + `highlight-text`.
- **Floating Bulk Action Bar:** appears when `data-table` rows are selected; `text-morph` count, `kbd` hints.
- **Tags Input:** paste "a, b, c" to split into chips; backspace edits the last chip.
- **Stepper / Wizard:** `transition-panel` + `use-animated-height` + `form` validation per step.
- **Time / Duration Picker:** `circular-slider` as a clock face plus `number-field`.
- **Shortcut Recorder:** capture a key combo, render as `kbd` chips, flag conflicts.
- **Color Picker:** `slider`, `number-field`, `copy-button` in a `popover`; EyeDropper API where supported.
- **Inline Editable Text:** click to edit, Enter saves, Esc cancels, `text-morph` on commit.
- **Activity Heatmap:** contribution grid with `date-utils`, `tooltip`, keyboard navigation.
- **Before/After Compare:** draggable divider between two images, keyboard accessible like `slider`.
- **AI Prompt Input:** auto-growing textarea, attachments, model `select`, send/stop morph, `shimmer` while streaming.
