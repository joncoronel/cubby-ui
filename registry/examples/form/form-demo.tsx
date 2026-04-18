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

async function submitForm(
  value: string,
): Promise<{ error: string } | { error: null }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const url = new URL(value);
    if (url.hostname.endsWith("example.com")) {
      return { error: "The example domain is not allowed" };
    }
  } catch {
    return { error: "This is not a valid URL" };
  }

  return { error: null };
}

export default function FormDemo() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  return (
    <Form
      className="w-full max-w-sm space-y-4"
      errors={errors}
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const value = formData.get("url") as string;

        setLoading(true);
        const response = await submitForm(value);
        setLoading(false);

        if (response.error) {
          setErrors({ url: response.error });
        } else {
          setErrors({});
          alert("Form submitted successfully!");
        }
      }}
    >
      <Field name="url">
        <FieldLabel>Homepage</FieldLabel>
        <FieldControl
          type="url"
          required
          defaultValue="https://example.com"
          placeholder="https://example.com"
          pattern="https?://.*"
        />
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}
