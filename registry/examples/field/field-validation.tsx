"use client";

import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

export default function FieldValidation() {
  return (
    <Form className="w-full max-w-sm space-y-4">
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
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
