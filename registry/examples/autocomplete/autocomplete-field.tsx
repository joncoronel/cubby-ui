"use client";

import { Button } from "@/registry/default/button/button";
import {
  AutocompleteRoot,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteEmpty,
} from "@/registry/default/autocomplete/autocomplete";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";

interface Image {
  url: string;
  name: string;
}

const images: Image[] = [
  { url: "docker.io/library/nginx:1.29-alpine", name: "nginx:1.29-alpine" },
  { url: "docker.io/library/node:22-slim", name: "node:22-slim" },
  { url: "docker.io/library/postgres:18", name: "postgres:18" },
  { url: "docker.io/library/redis:8.2.2-alpine", name: "redis:8.2.2-alpine" },
];

export default function AutocompleteField() {
  return (
    <Form
      className="space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="containerImage">
        <AutocompleteRoot
          items={images}
          itemToStringValue={(item: Image) => item.url}
          required
        >
          <FieldLabel>Container image</FieldLabel>
          <AutocompleteInput placeholder="e.g. docker.io/library/node:latest" />
          <FieldDescription>
            Enter a registry URL with optional tags
          </FieldDescription>
          <AutocompletePortal>
            <AutocompletePositioner>
              <AutocompletePopup>
                <AutocompleteEmpty>No images found.</AutocompleteEmpty>
                <AutocompleteList>
                  {(image: Image) => (
                    <AutocompleteItem key={image.url} value={image}>
                      {image.name}
                    </AutocompleteItem>
                  )}
                </AutocompleteList>
              </AutocompletePopup>
            </AutocompletePositioner>
          </AutocompletePortal>
        </AutocompleteRoot>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
