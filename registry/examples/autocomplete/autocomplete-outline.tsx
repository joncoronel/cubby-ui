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

export default function AutocompleteOutline() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Default and outline</CardTitle>
        <CardDescription>
          Both read on a Card. <code>outline</code> takes the outline
          Button&apos;s fill and edge.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AutocompleteRoot items={tags}>
          <Label className="w-full">
            Default
            <AutocompleteInput placeholder="Filled tint" />
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
            Outline
            <AutocompleteInput
              variant="outline"
              placeholder="Fill with an edge"
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
