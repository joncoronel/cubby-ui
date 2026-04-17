"use client";

import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

export default function FieldDemo() {
  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="username">
        <FieldLabel>Username</FieldLabel>
        <FieldControl required minLength={3} placeholder="Enter a username" />
        <FieldDescription>Must be at least 3 characters long</FieldDescription>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
