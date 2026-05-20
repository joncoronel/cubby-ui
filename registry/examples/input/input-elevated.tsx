import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function InputElevated() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> when the input sits
          inside a Card, Dialog, or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="input-default">Default</Label>
          <Input id="input-default" placeholder="Collapses into the card" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="input-elevated">Elevated</Label>
          <Input
            id="input-elevated"
            variant="elevated"
            placeholder="Reads against the substrate"
          />
        </div>
      </CardContent>
    </Card>
  );
}
