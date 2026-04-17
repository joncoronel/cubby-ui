"use client";

import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldError,
  FieldItem,
  FieldLabel,
} from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";
import { Form } from "@/registry/default/form/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/default/radio-group/radio-group";

export default function FieldWithRadioGroup() {
  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="plan">
        <Fieldset render={<RadioGroup defaultValue="free" />}>
          <FieldsetLegend>Select a plan</FieldsetLegend>
          <FieldItem>
            <FieldLabel>
              <RadioGroupItem value="free" />
              Free
            </FieldLabel>
          </FieldItem>
          <FieldItem>
            <FieldLabel>
              <RadioGroupItem value="pro" />
              Pro
            </FieldLabel>
          </FieldItem>
          <FieldItem>
            <FieldLabel>
              <RadioGroupItem value="enterprise" />
              Enterprise
            </FieldLabel>
          </FieldItem>
        </Fieldset>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
