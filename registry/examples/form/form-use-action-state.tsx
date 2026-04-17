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

interface FormState {
  serverErrors?: Record<string, string>;
}

// In a real app, mark this with 'use server' in a framework like Next.js
async function submitForm(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const username = formData.get("username") as string | null;

  if (username === "admin") {
    return {
      serverErrors: { username: "'admin' is reserved for system use" },
    };
  }

  if (username && username.length < 3) {
    return {
      serverErrors: { username: "Username must be at least 3 characters" },
    };
  }

  return {};
}

export default function FormUseActionState() {
  const [state, formAction, loading] = React.useActionState(submitForm, {});

  return (
    <Form
      action={formAction}
      errors={state.serverErrors}
      className="w-full max-w-sm space-y-4"
    >
      <Field name="username">
        <FieldLabel>Username</FieldLabel>
        <FieldControl
          required
          defaultValue="admin"
          placeholder="e.g. alice132"
        />
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}
