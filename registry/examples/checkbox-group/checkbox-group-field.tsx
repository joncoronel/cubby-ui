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

export default function CheckboxGroupField() {
  return (
    <Form
      className="space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="skills">
        <Fieldset render={<CheckboxGroup defaultValue={[]} />}>
          <FieldsetLegend>Skills</FieldsetLegend>
          {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
            <FieldItem key={skill}>
              <FieldLabel>
                <Checkbox value={skill.toLowerCase().replace(".", "")} />
                {skill}
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
