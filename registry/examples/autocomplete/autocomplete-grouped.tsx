import {
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
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
  label: string;
  group: "Type" | "Component";
}

interface TagGroup {
  value: string;
  items: Tag[];
}

const tagsData: Tag[] = [
  { id: "t1", label: "feature", group: "Type" },
  { id: "t2", label: "fix", group: "Type" },
  { id: "t3", label: "bug", group: "Type" },
  { id: "t4", label: "docs", group: "Type" },
  { id: "t5", label: "internal", group: "Type" },
  { id: "t6", label: "mobile", group: "Type" },
  { id: "c-accordion", label: "component: accordion", group: "Component" },
  {
    id: "c-alert-dialog",
    label: "component: alert dialog",
    group: "Component",
  },
  {
    id: "c-autocomplete",
    label: "component: autocomplete",
    group: "Component",
  },
  { id: "c-avatar", label: "component: avatar", group: "Component" },
  { id: "c-checkbox", label: "component: checkbox", group: "Component" },
  {
    id: "c-checkbox-group",
    label: "component: checkbox group",
    group: "Component",
  },
  { id: "c-collapsible", label: "component: collapsible", group: "Component" },
  { id: "c-combobox", label: "component: combobox", group: "Component" },
  {
    id: "c-context-menu",
    label: "component: context menu",
    group: "Component",
  },
  { id: "c-dialog", label: "component: dialog", group: "Component" },
  { id: "c-field", label: "component: field", group: "Component" },
  { id: "c-fieldset", label: "component: fieldset", group: "Component" },
  {
    id: "c-filterable-menu",
    label: "component: filterable menu",
    group: "Component",
  },
  { id: "c-form", label: "component: form", group: "Component" },
  { id: "c-input", label: "component: input", group: "Component" },
  { id: "c-menu", label: "component: menu", group: "Component" },
  { id: "c-menubar", label: "component: menubar", group: "Component" },
  { id: "c-meter", label: "component: meter", group: "Component" },
  {
    id: "c-navigation-menu",
    label: "component: navigation menu",
    group: "Component",
  },
  {
    id: "c-number-field",
    label: "component: number field",
    group: "Component",
  },
  { id: "c-popover", label: "component: popover", group: "Component" },
  {
    id: "c-preview-card",
    label: "component: preview card",
    group: "Component",
  },
  { id: "c-progress", label: "component: progress", group: "Component" },
  { id: "c-radio", label: "component: radio", group: "Component" },
  { id: "c-scroll-area", label: "component: scroll area", group: "Component" },
  { id: "c-select", label: "component: select", group: "Component" },
  { id: "c-separator", label: "component: separator", group: "Component" },
  { id: "c-slider", label: "component: slider", group: "Component" },
  { id: "c-switch", label: "component: switch", group: "Component" },
  { id: "c-tabs", label: "component: tabs", group: "Component" },
  { id: "c-toast", label: "component: toast", group: "Component" },
  { id: "c-toggle", label: "component: toggle", group: "Component" },
  {
    id: "c-toggle-group",
    label: "component: toggle group",
    group: "Component",
  },
  { id: "c-toolbar", label: "component: toolbar", group: "Component" },
  { id: "c-tooltip", label: "component: tooltip", group: "Component" },
];

function groupTags(tags: Tag[]): TagGroup[] {
  const groups: { [key: string]: Tag[] } = {};
  tags.forEach((t) => {
    (groups[t.group] ??= []).push(t);
  });
  const order = ["Type", "Component"];
  return order.map((value) => ({ value, items: groups[value] ?? [] }));
}

const groupedTags: TagGroup[] = groupTags(tagsData);

export default function AutocompleteGrouped() {
  return (
    <AutocompleteRoot items={groupedTags}>
      <Label className="w-full max-w-xs">
        Select a tag
        <AutocompleteInput placeholder="e.g. feature" />
      </Label>

      <AutocompletePortal>
        <AutocompletePositioner>
          <AutocompletePopup className="overflow-hidden p-0">
            <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
            <AutocompleteList className="max-h-[min(22.5rem,var(--available-height))] scroll-pt-10 scroll-pb-[0.35rem] overflow-y-auto overscroll-contain px-2">
              {(group: TagGroup) => (
                <AutocompleteGroup key={group.value} items={group.items}>
                  <AutocompleteGroupLabel className="bg-popover sticky top-0 z-[1] mt-0 mr-2 mb-0 ml-0 w-[calc(100%-0.5rem)] px-2 py-2 text-xs font-semibold tracking-wider uppercase">
                    {group.value}
                  </AutocompleteGroupLabel>
                  <AutocompleteCollection>
                    {(tag: Tag) => (
                      <AutocompleteItem key={tag.id} value={tag}>
                        {tag.label}
                      </AutocompleteItem>
                    )}
                  </AutocompleteCollection>
                </AutocompleteGroup>
              )}
            </AutocompleteList>
          </AutocompletePopup>
        </AutocompletePositioner>
      </AutocompletePortal>
    </AutocompleteRoot>
  );
}
