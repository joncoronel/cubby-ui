"use client";

import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

export default function FieldPerStateMessages() {
  return (
    <Form className="w-full max-w-sm space-y-4">
      <Field name="username">
        <FieldLabel>Username</FieldLabel>
        <FieldControl
          required
          minLength={3}
          pattern="[a-zA-Z0-9_]+"
          placeholder="Choose a username"
        />
        <FieldError match="valueMissing">You must create a username</FieldError>
        <FieldError match="tooShort">
          Username must be at least 3 characters
        </FieldError>
        <FieldError match="patternMismatch">
          Only letters, numbers, and underscores
        </FieldError>
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
