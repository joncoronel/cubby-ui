"use client";

import { Minus, Plus } from "lucide-react";
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
              <Minus className="size-4" />
            </NumberFieldDecrement>
            <NumberFieldInput />
            <NumberFieldIncrement>
              <Plus className="size-4" />
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
