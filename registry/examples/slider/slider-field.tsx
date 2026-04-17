"use client";

import { Button } from "@/registry/default/button/button";
import { Field } from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";
import { Form } from "@/registry/default/form/form";
import { Slider, SliderLabel, SliderValue } from "@/registry/default/slider/slider";

export default function SliderField() {
  return (
    <Form
      className="w-full max-w-xs space-y-6"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Slider name="volume" defaultValue={[50]}>
        <div className="flex items-center justify-between">
          <SliderLabel>Volume</SliderLabel>
          <SliderValue />
        </div>
      </Slider>

      <Field name="priceRange">
        <Fieldset
          render={
            <Slider
              defaultValue={[20, 80]}
              getAriaLabel={(index) =>
                index === 0 ? "Minimum price" : "Maximum price"
              }
            />
          }
        >
          <div className="flex items-center justify-between">
            <FieldsetLegend>Price range</FieldsetLegend>
            <SliderValue />
          </div>
        </Fieldset>
      </Field>

      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
