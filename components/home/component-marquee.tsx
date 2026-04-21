// Source of truth: content/docs/components/meta.json
const COMPONENTS = [
  "Accordion",
  "Autocomplete",
  "Alert dialog",
  "Badge",
  "Button",
  "Button group",
  "Card",
  "Checkbox",
  "Checkbox group",
  "Circular slider",
  "Code block",
  "Combobox",
  "Command",
  "Copy button",
  "Data table",
  "Dialog",
  "Drawer",
  "Dropdown menu",
  "Fancy button",
  "Field",
  "Fieldset",
  "Form",
  "Input",
  "Input group",
  "Label",
  "Number field",
  "Navigation menu",
  "Popover",
  "Radio group",
  "Scroll area",
  "Select",
  "Sheet",
  "Skeleton",
  "Switch",
  "Table",
  "Tabs",
  "Toast",
  "Toolbar",
  "Tooltip",
  "Tree",
];

export function ComponentMarquee() {
  return (
    <section
      aria-label="Every component"
      className="border-border/60 relative overflow-hidden border-y py-6"
    >
      {/* Fade edges */}
      <div
        aria-hidden="true"
        className="from-background via-background/0 pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-linear-to-r"
      />
      <div
        aria-hidden="true"
        className="from-background via-background/0 pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-linear-to-l"
      />

      <div className="marquee flex gap-8 whitespace-nowrap">
        {/* Render list twice for seamless loop */}
        {[0, 1].map((copyIdx) => (
          <ul
            key={copyIdx}
            aria-hidden={copyIdx === 1}
            className="flex shrink-0 items-center gap-8"
          >
            {COMPONENTS.map((name) => (
              <li
                key={`${copyIdx}-${name}`}
                className="text-muted-foreground/60 flex items-center gap-8 text-sm font-normal md:text-base"
              >
                <span>{name}</span>
                <span
                  aria-hidden="true"
                  className="text-border/70 text-sm md:text-base"
                >
                  ·
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
