"use client";

import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";
import { Input } from "@/registry/default/input/input";

export default function InputField() {
  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" required placeholder="you@example.com" />
        <FieldDescription>
          We&apos;ll never share your email with anyone else.
        </FieldDescription>
        <FieldError match="valueMissing">Email is required</FieldError>
        <FieldError match="typeMismatch">Enter a valid email address</FieldError>
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
