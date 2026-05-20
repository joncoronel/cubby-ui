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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
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
];

export default function AutocompleteElevated() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> on{" "}
          <code>AutocompleteInput</code> when the autocomplete sits inside a
          Card, Dialog, or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AutocompleteRoot items={tags}>
          <Label className="w-full">
            Default
            <AutocompleteInput placeholder="Collapses into the card" />
          </Label>
          <AutocompletePortal>
            <AutocompletePositioner>
              <AutocompletePopup>
                <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
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

        <AutocompleteRoot items={tags}>
          <Label className="w-full">
            Elevated
            <AutocompleteInput
              variant="elevated"
              placeholder="Reads against the substrate"
            />
          </Label>
          <AutocompletePortal>
            <AutocompletePositioner>
              <AutocompletePopup>
                <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
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
      </CardContent>
    </Card>
  );
}
