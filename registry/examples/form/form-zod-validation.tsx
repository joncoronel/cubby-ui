"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce
    .number({ message: "Age must be a number" })
    .positive("Age must be a positive number"),
});

export default function FormZodValidation() {
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  return (
    <Form
      className="w-full max-w-sm space-y-4"
      errors={errors}
      onFormSubmit={async (formValues) => {
        const result = schema.safeParse(formValues);

        if (!result.success) {
          setErrors(z.flattenError(result.error).fieldErrors);
        } else {
          setErrors({});
          alert(JSON.stringify(result.data, null, 2));
        }
      }}
    >
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <FieldControl placeholder="Enter name" />
        <FieldError />
      </Field>
      <Field name="age">
        <FieldLabel>Age</FieldLabel>
        <FieldControl placeholder="Enter age" />
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
