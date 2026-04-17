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

const TAKEN_USERNAMES = ["admin", "root", "superuser", "moderator"];

export default function FieldCustomValidation() {
  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onFormSubmit={(values) => {
        alert(`Username "${values.username}" is available!`);
      }}
    >
      <Field
        name="username"
        validationMode="onChange"
        validationDebounceTime={300}
        validate={(value) => {
          if (typeof value === "string" && TAKEN_USERNAMES.includes(value)) {
            return `"${value}" is already taken`;
          }
          return null;
        }}
      >
        <FieldLabel>Username</FieldLabel>
        <FieldControl required minLength={3} placeholder="Choose a username" />
        <FieldDescription>
          Try &quot;admin&quot; or &quot;root&quot; to see validation
        </FieldDescription>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Check availability
      </Button>
    </Form>
  );
}
