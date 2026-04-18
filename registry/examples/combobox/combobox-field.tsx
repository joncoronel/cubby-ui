"use client";

import { Button } from "@/registry/default/button/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/registry/default/combobox/combobox";
import { Field, FieldError, FieldLabel } from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

const regions = [
  "us-east-1",
  "us-west-2",
  "eu-central-1",
  "eu-west-1",
  "ap-southeast-1",
  "ap-northeast-1",
];

export default function ComboboxField() {
  return (
    <Form
      className="w-full max-w-3xs space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="region">
        <Combobox items={regions} required>
          <FieldLabel>Region</FieldLabel>
          <ComboboxInput placeholder="Search regions..." />
          <ComboboxPopup>
            <ComboboxEmpty>No regions found.</ComboboxEmpty>
            <ComboboxList>
              {(region: string) => (
                <ComboboxItem key={region} value={region}>
                  {region}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
