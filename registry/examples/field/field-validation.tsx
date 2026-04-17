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
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl type="email" required placeholder="you@example.com" />
        <FieldError match="valueMissing">Please enter your email</FieldError>
        <FieldError match="typeMismatch">
          Please enter a valid email address
        </FieldError>
      </Field>
      <Field name="password">
        <FieldLabel>Password</FieldLabel>
        <FieldControl
          type="password"
          required
          minLength={8}
          pattern="(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*"
          placeholder="Enter a password"
        />
        <FieldError match="valueMissing">Please enter a password</FieldError>
        <FieldError match="tooShort">
          Password must be at least 8 characters
        </FieldError>
        <FieldError match="patternMismatch">
          Must include uppercase, lowercase, and a number
        </FieldError>
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
