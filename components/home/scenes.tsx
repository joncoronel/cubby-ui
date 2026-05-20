"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  CommandIcon,
  File01Icon,
  Folder01Icon,
  FolderOpenIcon,
  GithubIcon,
  InformationCircleIcon,
  MinusSignIcon,
  Moon01Icon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  Sun01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Command,
  CommandCollection,
  CommandContent,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/default/command/command";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/default/accordion/accordion";
import { Badge } from "@/registry/default/badge/badge";
import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/default/number-field/number-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/table/table";
import {
  Tree,
  TreeItem,
  TreeItemIcon,
  TreeItemLabel,
  type TreeNode,
} from "@/registry/default/tree/tree";
import { cn } from "@/lib/utils";

/* Through-line: all frames share border-color and rounded geometry.
   Everything else varies per scene. */

/* -------------------------------------------------------------------------- */
/* Scene 1 — Command palette (default card) */

interface CommandDatum {
  value: string;
  label: string;
  icon: IconSvgElement;
  shortcut?: string;
}

const commandGroups: { label: string; items: CommandDatum[] }[] = [
  {
    label: "Jump to",
    items: [
      { value: "components", label: "Browse components", icon: Folder01Icon, shortcut: "⌘C" },
      { value: "getting-started", label: "Getting started", icon: File01Icon, shortcut: "⌘G" },
      { value: "changelog", label: "Changelog", icon: InformationCircleIcon },
    ],
  },
  {
    label: "Actions",
    items: [
      { value: "github", label: "Open on GitHub", icon: GithubIcon },
      { value: "settings", label: "Preferences", icon: Settings01Icon, shortcut: "⌘," },
    ],
  },
];

export function CommandScene() {
  return (
    <figure className="bg-card border-border/60 flex h-full flex-col overflow-hidden rounded-2xl border shadow-md">
      <figcaption className="border-border/60 flex flex-col gap-0.5 border-b px-5 py-3">
        <span className="text-foreground text-sm font-medium">Command</span>
        <span className="text-muted-foreground text-xs">
          Searchable command menu with keyboard shortcuts.
        </span>
      </figcaption>
      {/* Command placed directly inside the card \u2014 no nested chrome, no radius clash */}
      <div className="flex flex-1 flex-col">
        <Command
          className="flex-1 rounded-none bg-transparent p-0"
          items={commandGroups}
        >
          <CommandContent className="rounded-none ring-0 border-0">
            <CommandInput placeholder="Search components, docs, actions…" />
            <CommandList emptyMessage="No results.">
              {(group: { label: string; items: CommandDatum[] }, index: number) => (
                <React.Fragment key={group.label}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.label}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: CommandDatum) => (
                        <CommandItem key={item.value} value={item.value}>
                          <HugeiconsIcon
                            icon={item.icon}
                            className="mr-2 size-4"
                            strokeWidth={2}
                          />
                          <span>{item.label}</span>
                          {item.shortcut && (
                            <CommandShortcut>{item.shortcut}</CommandShortcut>
                          )}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                </React.Fragment>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 2 — Table (bleed: content edge-to-edge, no body padding) */

const invoices = [
  { id: "INV-0042", client: "Atelier Studio", status: "Paid" as const, amount: "$4,250" },
  { id: "INV-0041", client: "Northbound Co.", status: "Pending" as const, amount: "$1,820" },
  { id: "INV-0040", client: "Miller & Sons", status: "Paid" as const, amount: "$3,140" },
  { id: "INV-0039", client: "Quiet Labs", status: "Overdue" as const, amount: "$980" },
];

function InvoiceStatus({ status }: { status: "Paid" | "Pending" | "Overdue" }) {
  if (status === "Paid") return <Badge variant="success">Paid</Badge>;
  if (status === "Pending") return <Badge variant="secondary">Pending</Badge>;
  return <Badge variant="danger">Overdue</Badge>;
}

export function InvoiceTableScene() {
  return (
    <figure className="bg-card border-border/60 flex h-full flex-col overflow-hidden rounded-2xl border shadow-md">
      <figcaption className="border-border/60 flex flex-col gap-0.5 border-b px-5 py-3">
        <span className="text-foreground text-sm font-medium">Table</span>
        <span className="text-muted-foreground text-xs">
          Semantic table with styled headers, rows, and cells.
        </span>
      </figcaption>
      <div className="flex-1 p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                <TableCell className="font-medium">{inv.client}</TableCell>
                <TableCell>
                  <InvoiceStatus status={inv.status} />
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {inv.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 3 — Toast (surface: tinted desktop bg, no card, no header bar) */

const toastStack = [
  {
    icon: CheckmarkCircle01Icon,
    iconClass: "text-success-foreground",
    title: "Project published",
    body: "Deployed to production in 12.4s.",
  },
  {
    icon: InformationCircleIcon,
    iconClass: "text-muted-foreground",
    title: "Invite sent to Bennett",
    body: "They'll get an email.",
  },
  {
    icon: UserCircleIcon,
    iconClass: "text-muted-foreground",
    title: "Alma joined the project",
    body: "Assigned the lead role.",
  },
];

export function ToastScene() {
  return (
    <figure
      className={cn(
        "border-border/60 relative flex h-full flex-col overflow-hidden rounded-2xl border",
        // Subtle diagonal stripe pattern to feel like a desktop/wallpaper
        "bg-[repeating-linear-gradient(135deg,var(--muted)_0px,var(--muted)_8px,transparent_8px,transparent_16px)]",
        "before:bg-muted/40 before:absolute before:inset-0 before:content-['']",
      )}
    >
      <div className="relative flex h-full min-h-[260px] flex-col justify-end gap-2 p-5">
        <div className="text-muted-foreground mb-auto text-xs">
          <span className="text-foreground text-sm font-medium">Toast</span>
          <span className="mx-1.5 opacity-40">·</span>
          <span>Notifications, stacked.</span>
        </div>
        {toastStack.map((t) => (
          <div
            key={t.title}
            className={cn(
              "bg-card text-card-foreground flex items-start gap-3 rounded-lg border",
              "bg-clip-padding px-4 py-3 shadow-lg/4",
            )}
          >
            <HugeiconsIcon
              icon={t.icon}
              className={cn("mt-0.5 size-4 shrink-0", t.iconClass)}
              strokeWidth={2}
            />
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">{t.title}</span>
              <span className="text-muted-foreground text-xs">{t.body}</span>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 4 — Form controls (default card) */

export function FormControlsScene() {
  return (
    <figure className="bg-card border-border/60 flex h-full flex-col overflow-hidden rounded-2xl border shadow-md">
      <figcaption className="border-border/60 flex flex-col gap-0.5 border-b px-5 py-3">
        <span className="text-foreground text-sm font-medium">Form controls</span>
        <span className="text-muted-foreground text-xs">
          Switch, NumberField, and Badge.
        </span>
      </figcaption>
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              icon={Sun01Icon}
              className="text-muted-foreground size-4"
              strokeWidth={2}
            />
            <div className="flex flex-col">
              <Label htmlFor="theme-switch">Appearance</Label>
              <span className="text-muted-foreground text-xs">
                Sync with your system.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Moon01Icon}
              className="text-muted-foreground size-4"
              strokeWidth={2}
            />
            <Switch id="theme-switch" defaultChecked />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="session-length">Focus block (min)</Label>
          <NumberField id="session-length" defaultValue={45} min={5} max={180}>
            <NumberFieldGroup variant="elevated">
              <NumberFieldDecrement>
                <HugeiconsIcon
                  icon={MinusSignIcon}
                  className="size-3.5"
                  strokeWidth={2}
                />
              </NumberFieldDecrement>
              <NumberFieldInput />
              <NumberFieldIncrement>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="size-3.5"
                  strokeWidth={2}
                />
              </NumberFieldIncrement>
            </NumberFieldGroup>
          </NumberField>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>TypeScript</Badge>
          <Badge variant="secondary">Base UI</Badge>
          <Badge variant="outline">Tailwind 4</Badge>
          <Badge variant="outline">Accessible</Badge>
        </div>
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 5 — Accordion / FAQ (flat: border only, no shadow, like a document section) */

export function FaqScene() {
  return (
    <figure className="border-border/60 flex h-full flex-col overflow-hidden rounded-2xl border border-dashed">
      <figcaption className="border-border/60 flex flex-col gap-0.5 border-b border-dashed px-5 py-3">
        <span className="text-foreground text-sm font-medium">Accordion</span>
        <span className="text-muted-foreground text-xs">
          Collapsible sections with smooth height transitions.
        </span>
      </figcaption>
      <div className="flex-1 p-5">
        <Accordion variant="default" defaultValue={["q1"]}>
          <AccordionItem value="q1">
            <AccordionTrigger>Is the source mine to keep?</AccordionTrigger>
            <AccordionContent>
              Yes. Every component lands in your project on install. Fork it,
              rename it, change its API. There&apos;s no package to update.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>What&apos;s under the hood?</AccordionTrigger>
            <AccordionContent>
              Base UI primitives for behavior, Tailwind CSS 4 for styling, CVA
              for variants. Nothing exotic.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger>Does it work with shadcn?</AccordionTrigger>
            <AccordionContent>
              Install through the shadcn CLI. Drops right next to your existing
              components.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 6 — Tree (terminal: dark bg, mono, prompt-style header) */

const folderIcon = (
  <HugeiconsIcon
    icon={Folder01Icon}
    className="size-4 text-amber-500/70 dark:text-amber-400/70"
    strokeWidth={2}
  />
);
const folderOpenIcon = (
  <HugeiconsIcon
    icon={FolderOpenIcon}
    className="size-4 text-amber-500/70 dark:text-amber-400/70"
    strokeWidth={2}
  />
);
const fileIcon = (
  <HugeiconsIcon
    icon={File01Icon}
    className="size-4 text-neutral-400"
    strokeWidth={2}
  />
);

const treeData: TreeNode[] = [
  {
    id: "components",
    name: "components",
    icon: folderIcon,
    iconOpen: folderOpenIcon,
    children: [
      {
        id: "components/ui",
        name: "ui",
        icon: folderIcon,
        iconOpen: folderOpenIcon,
        children: [
          { id: "button.tsx", name: "button.tsx", icon: fileIcon },
          { id: "input.tsx", name: "input.tsx", icon: fileIcon },
          { id: "select.tsx", name: "select.tsx", icon: fileIcon },
          { id: "tabs.tsx", name: "tabs.tsx", icon: fileIcon },
        ],
      },
      {
        id: "components/site",
        name: "site",
        icon: folderIcon,
        iconOpen: folderOpenIcon,
        children: [{ id: "nav.tsx", name: "nav.tsx", icon: fileIcon }],
      },
    ],
  },
  { id: "tailwind.config.ts", name: "tailwind.config.ts", icon: fileIcon },
  { id: "package.json", name: "package.json", icon: fileIcon },
];

export function TreeScene() {
  return (
    <figure
      className="border-border/60 flex h-full flex-col overflow-hidden rounded-2xl border bg-neutral-950 text-neutral-200"
      style={{
        // Override the app accent colors within the terminal scope so the Tree's
        // internal hover:bg-accent / data-selected:bg-accent look right on a dark bg.
        ["--accent" as string]: "oklch(0.22 0 0)",
        ["--accent-foreground" as string]: "oklch(0.94 0 0)",
        ["--ring" as string]: "oklch(0.55 0.15 150)",
      }}
    >
      <figcaption className="flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5 font-mono text-xs">
        <span className="flex gap-1">
          <span className="size-2.5 rounded-full bg-neutral-700" />
          <span className="size-2.5 rounded-full bg-neutral-700" />
          <span className="size-2.5 rounded-full bg-neutral-700" />
        </span>
        <span className="ml-2 text-neutral-400">
          <span className="text-emerald-400">~/my-app</span>
          <span className="text-neutral-500"> $ </span>
          <span className="text-neutral-200">tree components</span>
        </span>
      </figcaption>
      <div className="flex-1 p-4 font-mono text-sm">
        <Tree
          data={treeData}
          defaultExpanded={["components", "components/ui"]}
        >
          {(item) => (
            <TreeItem>
              {item.icon && <TreeItemIcon>{item.icon}</TreeItemIcon>}
              <TreeItemLabel>{item.name}</TreeItemLabel>
            </TreeItem>
          )}
        </Tree>
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Scene 7 — Search (minimal: small, no header bar, inline caption) */

export function SearchScene() {
  return (
    <figure className="bg-card/60 border-border/60 flex h-full flex-col overflow-hidden rounded-2xl border">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground text-sm font-medium">Search</span>
          <span className="text-muted-foreground text-xs">
            Input paired with a keyboard shortcut hint.
          </span>
        </div>
        <div className="border-border/60 bg-muted/40 flex items-center gap-3 rounded-lg border px-3 py-2">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground size-4"
            strokeWidth={2}
          />
          <span className="text-muted-foreground flex-1 text-sm">
            Search docs…
          </span>
          <div className="text-muted-foreground flex items-center gap-1 font-mono text-xs">
            <kbd className="border-border/60 bg-background rounded-sm border px-1.5 py-0.5">
              <HugeiconsIcon
                icon={CommandIcon}
                className="inline-block size-2.5"
                strokeWidth={2}
              />
            </kbd>
            <kbd className="border-border/60 bg-background rounded-sm border px-1.5 py-0.5">
              K
            </kbd>
          </div>
        </div>
        <div className="text-muted-foreground mt-auto text-xs">
          Pairs with <span className="text-foreground font-medium">Command</span>,{" "}
          <span className="text-foreground font-medium">Dialog</span>, or{" "}
          <span className="text-foreground font-medium">Popover</span>.
        </div>
      </div>
    </figure>
  );
}
