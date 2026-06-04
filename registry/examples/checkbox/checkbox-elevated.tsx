import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxElevated() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> when the checkbox sits
          inside a Card, Dialog, or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Label className="flex flex-row items-center gap-2">
          <Checkbox id="checkbox-default" />
          Default — collapses into the card
        </Label>
        <Label className="flex flex-row items-center gap-2">
          <Checkbox id="checkbox-elevated" variant="elevated" />
          Elevated — reads against the substrate
        </Label>
      </CardContent>
    </Card>
  );
}
