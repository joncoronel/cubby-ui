import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Label } from "@/registry/default/label/label";
import { Textarea } from "@/registry/default/textarea/textarea";

export default function TextareaOutline() {
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
          <Label htmlFor="textarea-default">Default</Label>
          <Textarea id="textarea-default" placeholder="Filled tint" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="textarea-outline">Outline</Label>
          <Textarea
            id="textarea-outline"
            variant="outline"
            placeholder="Fill with an edge"
          />
        </div>
      </CardContent>
    </Card>
  );
}
