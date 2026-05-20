"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Calendar01Icon,
  CursorEdit02Icon,
  MinusSignIcon,
  PlusSignIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Switch } from "@/registry/default/switch/switch";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";
import { toast } from "@/registry/default/toast/toast";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/default/number-field/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/registry/default/combobox/combobox";

const priorityItems = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const dueDateItems = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "End of this week", value: "eow" },
  { label: "End of next week", value: "eonw" },
  { label: "End of month", value: "eom" },
];

const teammates = [
  "Alma Ibarra",
  "Bennett Cross",
  "Celia Marcelo",
  "Dmitri Rojas",
  "Ez Nakamura",
  "Farah Attia",
  "Greta Holm",
];

export function WorkspacePanel() {
  return (
    <div className="bg-card border-border/60 ring-background/40 relative overflow-hidden rounded-2xl border shadow-md ring-4">
      {/* Toolbar — gives interactivity affordance */}
      <div className="border-border/60 bg-muted/40 flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex flex-col">
          <h3 className="font-rubik text-foreground text-sm leading-none font-semibold tracking-tight">
            New project
          </h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Project details and scheduling.
          </p>
        </div>
        <div className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
          <HugeiconsIcon
            icon={CursorEdit02Icon}
            className="size-3.5"
            strokeWidth={2}
          />
          <span>Every field is live — try it.</span>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[1.6fr_1fr] md:gap-8 md:p-8">
        {/* LEFT — form column */}
        <div className="flex flex-col gap-5">

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                variant="elevated"
                defaultValue="Cubby UI — landing page"
                placeholder="e.g. Website redesign"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select items={priorityItems} defaultValue="high">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger>
                  {priorityItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Due date</Label>
              <Select items={dueDateItems} defaultValue="eow">
                <SelectTrigger>
                  <SelectValue placeholder="Pick a date" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger>
                  {dueDateItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                variant="elevated"
                defaultValue="Atelier Studio"
                placeholder="Who is this for?"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="budget">Budgeted hours / week</Label>
              <NumberField id="budget" defaultValue={20} min={0} max={60}>
                <NumberFieldGroup variant="elevated">
                  <NumberFieldDecrement>
                    <HugeiconsIcon
                      icon={MinusSignIcon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  </NumberFieldDecrement>
                  <NumberFieldInput />
                  <NumberFieldIncrement>
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  </NumberFieldIncrement>
                </NumberFieldGroup>
              </NumberField>
            </div>
          </div>
        </div>

        {/* RIGHT — settings column */}
        <div className="bg-muted/40 border-border/50 flex flex-col gap-5 rounded-xl border p-5">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Briefcase01Icon}
              className="text-muted-foreground size-4"
              strokeWidth={2}
            />
            <span className="text-foreground text-sm font-medium">
              Team & settings
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Assign lead</Label>
            <Combobox items={teammates} defaultValue="Alma Ibarra">
              <ComboboxInput variant="elevated" placeholder="Search teammates" />
              <ComboboxPopup>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      <span className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={UserIcon}
                          className="text-muted-foreground size-3.5 shrink-0"
                          strokeWidth={2}
                        />
                        <span>{item}</span>
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxPopup>
            </Combobox>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="notify">Notify team</Label>
                <span className="text-muted-foreground text-xs">
                  Send a Slack message on create.
                </span>
              </div>
              <Switch id="notify" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="billable">Billable hours</Label>
                <span className="text-muted-foreground text-xs">
                  Track toward the retainer.
                </span>
              </div>
              <Switch id="billable" />
            </div>
          </div>

          <div className="bg-background/70 border-border/60 flex items-start gap-3 rounded-lg border p-3">
            <Checkbox id="recurring" defaultChecked className="mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="recurring" className="cursor-pointer">
                Repeat weekly
              </Label>
              <span className="text-muted-foreground text-xs">
                Restart the cycle every Monday.
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                toast({
                  title: "Draft saved",
                  description: "You can pick this back up any time.",
                })
              }
            >
              Save draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              leftSection={
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="size-3.5"
                  strokeWidth={2}
                />
              }
              onClick={() =>
                toast.success({
                  title: "Project scheduled",
                  description: "Your team has been notified.",
                })
              }
            >
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
