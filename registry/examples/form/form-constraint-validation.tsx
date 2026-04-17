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

export default function FormConstraintValidation() {
  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="website">
        <FieldLabel>Website</FieldLabel>
        <FieldControl
          type="url"
          required
          pattern="https?://.*"
          placeholder="https://example.com"
        />
        <FieldDescription>Must start with http:// or https://</FieldDescription>
        <FieldError match="valueMissing">Please enter a URL</FieldError>
        <FieldError match="typeMismatch">Please enter a valid URL</FieldError>
        <FieldError match="patternMismatch">
          URL must start with http:// or https://
        </FieldError>
      </Field>
      <Field name="age">
        <FieldLabel>Age</FieldLabel>
        <FieldControl
          type="number"
          required
          min={13}
          max={120}
          placeholder="Enter your age"
        />
        <FieldError match="valueMissing">Please enter your age</FieldError>
        <FieldError match="rangeUnderflow">
          You must be at least 13 years old
        </FieldError>
        <FieldError match="rangeOverflow">
          Please enter a valid age
        </FieldError>
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
