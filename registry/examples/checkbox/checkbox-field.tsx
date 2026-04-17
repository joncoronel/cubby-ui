"use client";

import { Button } from "@/registry/default/button/button";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Field, FieldError, FieldLabel } from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

export default function CheckboxField() {
  return (
    <Form
      className="space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="terms">
        <FieldLabel>
          <Checkbox required />
          I accept the terms and conditions
        </FieldLabel>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
