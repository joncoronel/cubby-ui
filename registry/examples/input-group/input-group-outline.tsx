import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";
import { Label } from "@/registry/default/label/label";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

export default function InputGroupOutline() {
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
          <Label htmlFor="input-group-default">Default</Label>
          <InputGroup>
            <InputGroupInput
              id="input-group-default"
              placeholder="Filled tint"
            />
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="input-group-outline">Outline</Label>
          <InputGroup variant="outline">
            <InputGroupInput
              id="input-group-outline"
              placeholder="Fill with an edge"
            />
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  );
}
