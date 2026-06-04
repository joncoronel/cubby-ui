import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Label } from "@/registry/default/label/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/default/radio-group/radio-group";

export default function RadioGroupElevated() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> on{" "}
          <code>RadioGroupItem</code> when the radio group sits inside a Card,
          Dialog, or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Default</p>
          <RadioGroup defaultValue="comfortable">
            <Label className="flex-row items-center gap-2">
              <RadioGroupItem value="default" />
              Default
            </Label>
            <Label className="flex-row items-center gap-2">
              <RadioGroupItem value="comfortable" />
              Comfortable
            </Label>
            <Label className="flex-row items-center gap-2">
              <RadioGroupItem value="compact" />
              Compact
            </Label>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Elevated</p>
          <RadioGroup defaultValue="comfortable">
            <Label className="flex-row items-center gap-2">
              <RadioGroupItem variant="elevated" value="default" />
              Default
            </Label>
            <Label className="flex-row items-center gap-2">
              <RadioGroupItem variant="elevated" value="comfortable" />
              Comfortable
            </Label>
            <Label className="flex-row items-center gap-2">
              <RadioGroupItem variant="elevated" value="compact" />
              Compact
            </Label>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
