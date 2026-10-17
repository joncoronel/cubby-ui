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

export default function NumberFieldOutline() {
  const defaultId = React.useId();
  const outlineId = React.useId();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Default and outline</CardTitle>
        <CardDescription>
          Both read on a Card. <code>outline</code> takes the outline
          Button&apos;s fill and edge.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <NumberField id={defaultId} defaultValue={100}>
          <Label htmlFor={defaultId}>Default</Label>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>

        <NumberField id={outlineId} defaultValue={100}>
          <Label htmlFor={outlineId}>Outline</Label>
          <NumberFieldGroup variant="outline">
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </CardContent>
    </Card>
  );
}
