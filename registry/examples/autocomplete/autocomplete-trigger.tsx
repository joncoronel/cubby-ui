"use client";

import * as React from "react";
import {
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteRoot,
} from "@/registry/default/autocomplete/autocomplete";
import { Label } from "@/registry/default/label/label";

interface Tag {
  id: string;
  value: string;
}

const tags: Tag[] = [
  { id: "t1", value: "feature" },
  { id: "t2", value: "fix" },
  { id: "t3", value: "bug" },
  { id: "t4", value: "docs" },
  { id: "t5", value: "internal" },
  { id: "t6", value: "mobile" },
  { id: "c-accordion", value: "component: accordion" },
  { id: "c-autocomplete", value: "component: autocomplete" },
  { id: "c-checkbox", value: "component: checkbox" },
  { id: "c-combobox", value: "component: combobox" },
  { id: "c-dialog", value: "component: dialog" },
  { id: "c-input", value: "component: input" },
  { id: "c-popover", value: "component: popover" },
  { id: "c-select", value: "component: select" },
];

export default function AutocompleteTriggerExample() {
  const [value, setValue] = React.useState("");

  return (
    <AutocompleteRoot items={tags} value={value} onValueChange={setValue}>
      <Label className="w-full max-w-xs">
        Search with trigger and clear
        <AutocompleteInput
          placeholder="e.g. feature or component"
          showTrigger
          showClear
        />
      </Label>

      <AutocompletePortal>
        <AutocompletePositioner sideOffset={4}>
          <AutocompletePopup>
            <AutocompleteEmpty>
              No tags found for &quot;{value}&quot;
            </AutocompleteEmpty>

            <AutocompleteList>
              {(tag: Tag) => (
                <AutocompleteItem key={tag.id} value={tag}>
                  {tag.value}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompletePopup>
        </AutocompletePositioner>
      </AutocompletePortal>
    </AutocompleteRoot>
  );
}
