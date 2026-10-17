import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Input } from "@/registry/default/input/input";
import { Label } from "@/registry/default/label/label";

export default function InputOutline() {
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="input-default">Default</Label>
          <Input id="input-default" placeholder="Filled tint" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="input-outline">Outline</Label>
          <Input
            id="input-outline"
            variant="outline"
            placeholder="Fill with an edge"
          />
        </div>
      </CardContent>
    </Card>
  );
}
