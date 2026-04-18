"use client";

import { Button } from "@/registry/default/button/button";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import {
  Field,
  FieldError,
  FieldItem,
  FieldLabel,
} from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";
import { Form } from "@/registry/default/form/form";

export default function FieldWithCheckboxGroup() {
  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="interests">
        <Fieldset render={<CheckboxGroup defaultValue={[]} />}>
          <FieldsetLegend>Interests</FieldsetLegend>
          {["Design", "Development", "Marketing"].map((interest) => (
            <FieldItem key={interest}>
              <FieldLabel>
                <Checkbox value={interest.toLowerCase()} />
                {interest}
              </FieldLabel>
            </FieldItem>
          ))}
        </Fieldset>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
