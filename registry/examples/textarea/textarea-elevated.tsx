import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Label } from "@/registry/default/label/label";
import { Textarea } from "@/registry/default/textarea/textarea";

export default function TextareaElevated() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> when the textarea sits
          inside a Card, Dialog, or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="textarea-default">Default</Label>
          <Textarea
            id="textarea-default"
            placeholder="Collapses into the card"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="textarea-elevated">Elevated</Label>
          <Textarea
            id="textarea-elevated"
            variant="elevated"
            placeholder="Reads against the substrate"
          />
        </div>
      </CardContent>
    </Card>
  );
}
