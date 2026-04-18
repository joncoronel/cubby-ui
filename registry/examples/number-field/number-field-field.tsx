"use client";

import { Button } from "@/registry/default/button/button";
import { Field, FieldError, FieldLabel } from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/default/number-field/number-field";

import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
export default function NumberFieldField() {
  return (
    <Form
      className="space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="quantity">
        <NumberField min={1} max={99} required>
          <FieldLabel>Quantity</FieldLabel>
          <NumberFieldGroup>
            <NumberFieldDecrement>
              <HugeiconsIcon icon={MinusSignIcon} className="size-4"  strokeWidth={2} />
            </NumberFieldDecrement>
            <NumberFieldInput />
            <NumberFieldIncrement>
              <HugeiconsIcon icon={PlusSignIcon} className="size-4"  strokeWidth={2} />
            </NumberFieldIncrement>
          </NumberFieldGroup>
        </NumberField>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
