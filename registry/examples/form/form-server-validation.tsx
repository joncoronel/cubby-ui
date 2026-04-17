"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

async function simulateServerValidation(values: Record<string, unknown>) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const errors: Record<string, string> = {};

  if (values.email === "taken@example.com") {
    errors.email = "This email is already registered";
  }

  if (values.username === "admin") {
    errors.username = "This username is reserved";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export default function FormServerValidation() {
  const [errors, setErrors] = React.useState<Record<string, string>>();
  const [loading, setLoading] = React.useState(false);

  return (
    <Form
      className="w-full max-w-sm space-y-4"
      errors={errors}
      onFormSubmit={async (values) => {
        setLoading(true);
        setErrors(undefined);
        const serverErrors = await simulateServerValidation(values);
        setLoading(false);

        if (serverErrors) {
          setErrors(serverErrors);
        } else {
          alert("Form submitted successfully!");
        }
      }}
    >
      <Field name="username">
        <FieldLabel>Username</FieldLabel>
        <FieldControl required placeholder="Choose a username" />
        <FieldError />
      </Field>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl type="email" required placeholder="you@example.com" />
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}
