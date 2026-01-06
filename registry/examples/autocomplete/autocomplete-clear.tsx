"use client";

import * as React from "react";
import {
  AutocompleteClear,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputWrapper,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteRoot,
} from "@/registry/default/autocomplete/autocomplete";
import { Label } from "@/registry/default/label/label";
import { X } from "lucide-react";

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
  { id: "c-alert-dialog", value: "component: alert dialog" },
  { id: "c-autocomplete", value: "component: autocomplete" },
  { id: "c-avatar", value: "component: avatar" },
  { id: "c-checkbox", value: "component: checkbox" },
  { id: "c-checkbox-group", value: "component: checkbox group" },
  { id: "c-collapsible", value: "component: collapsible" },
  { id: "c-combobox", value: "component: combobox" },
  { id: "c-context-menu", value: "component: context menu" },
  { id: "c-dialog", value: "component: dialog" },
  { id: "c-field", value: "component: field" },
  { id: "c-fieldset", value: "component: fieldset" },
  { id: "c-form", value: "component: form" },
  { id: "c-input", value: "component: input" },
  { id: "c-menu", value: "component: menu" },
  { id: "c-popover", value: "component: popover" },
  { id: "c-select", value: "component: select" },
  { id: "c-tabs", value: "component: tabs" },
  { id: "c-toast", value: "component: toast" },
  { id: "c-tooltip", value: "component: tooltip" },
];

export default function AutocompleteClearExample() {
  const [value, setValue] = React.useState("");

  return (
    <AutocompleteRoot items={tags} value={value} onValueChange={setValue}>
      <Label className="w-full max-w-xs">
        Search with clear button
        <AutocompleteInputWrapper>
          <AutocompleteInput placeholder="e.g. feature or component" />
          <div className="absolute inset-y-0 right-3 flex items-center">
            <AutocompleteClear>
              <X className="h-4 w-4" />
            </AutocompleteClear>
          </div>
        </AutocompleteInputWrapper>
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
