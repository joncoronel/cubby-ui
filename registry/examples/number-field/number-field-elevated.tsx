"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Label } from "@/registry/default/label/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/default/number-field/number-field";

import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";

export default function NumberFieldElevated() {
  const defaultId = React.useId();
  const elevatedId = React.useId();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> on{" "}
          <code>NumberFieldGroup</code> when the field sits inside a Card,
          Dialog, or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <NumberField id={defaultId} defaultValue={100}>
          <Label htmlFor={defaultId}>Default</Label>
          <NumberFieldGroup>
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

        <NumberField id={elevatedId} defaultValue={100}>
          <Label htmlFor={elevatedId}>Elevated</Label>
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
      </CardContent>
    </Card>
  );
}
