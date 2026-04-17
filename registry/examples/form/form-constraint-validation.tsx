"use client";

import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

export default function FormConstraintValidation() {
  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="website">
        <FieldLabel>Website</FieldLabel>
        <FieldControl
          type="url"
          required
          pattern="https?://.*"
          placeholder="https://example.com"
        />
        <FieldError />
      </Field>
      <Field name="age">
        <FieldLabel>Age</FieldLabel>
        <FieldControl
          type="number"
          required
          min={13}
          max={120}
          placeholder="Enter your age"
        />
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
