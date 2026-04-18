"use client";

import { Button } from "@/registry/default/button/button";
import { Field } from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";
import { Form } from "@/registry/default/form/form";
import {
  Slider,
  SliderLabel,
  SliderValue,
} from "@/registry/default/slider/slider";

export default function SliderField() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-10">
      {/*
       * Pattern 1 — Base UI's `onFormSubmit`.
       * Values are collected from registered Fields, so every slider must be
       * wrapped in <Field name="..."> (Fieldset is used for multi-thumb groups
       * so each thumb keeps its own aria-label under a shared legend).
       */}
      <Form
        className="space-y-6"
        onFormSubmit={(values) => {
          alert("onFormSubmit values\n" + JSON.stringify(values, null, 2));
        }}
      >
        <p className="text-muted-foreground text-xs">
          Using <code>onFormSubmit</code> — wrap each slider in{" "}
          <code>Field</code>.
        </p>

        <Field name="volume">
          <Slider defaultValue={50}>
            <div className="flex items-center justify-between">
              <SliderLabel>Volume</SliderLabel>
              <SliderValue />
            </div>
          </Slider>
        </Field>

        <Field name="priceRange">
          <Fieldset
            className="gap-0"
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
              <FieldsetLegend className="text-sm leading-5 font-medium">
                Price range
              </FieldsetLegend>
              <SliderValue />
            </div>
          </Fieldset>
        </Field>

        <Button type="submit" variant="neutral">
          Submit (onFormSubmit)
        </Button>
      </Form>

      {/*
       * Pattern 2 — Native `onSubmit` + FormData.
       * Slider renders a hidden input from its `name` prop, so the browser
       * picks it up via FormData. No Field wrapper required.
       */}
      <Form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const values = Object.fromEntries(formData.entries());
          alert("FormData values\n" + JSON.stringify(values, null, 2));
        }}
      >
        <p className="text-muted-foreground text-xs">
          Using native <code>onSubmit</code> — put <code>name</code> directly on{" "}
          <code>Slider</code>.
        </p>

        <Slider name="volume" defaultValue={50}>
          <div className="flex items-center justify-between">
            <SliderLabel>Volume</SliderLabel>
            <SliderValue />
          </div>
        </Slider>

        <Button type="submit" variant="neutral">
          Submit (FormData)
        </Button>
      </Form>
    </div>
  );
}
