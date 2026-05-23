import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";

const items = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
];

export default function SelectElevated() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>On a Card surface</CardTitle>
        <CardDescription>
          Use <code>variant=&quot;elevated&quot;</code> on{" "}
          <code>SelectTrigger</code> when the select sits inside a Card, Dialog,
          or popover.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Select items={items}>
          <div className="flex flex-col gap-1">
            <SelectLabel>Default</SelectLabel>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Collapses into the card" />
            </SelectTrigger>
          </div>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select items={items}>
          <div className="flex flex-col gap-1">
            <SelectLabel>Elevated</SelectLabel>
            <SelectTrigger variant="elevated" className="w-[220px]">
              <SelectValue placeholder="Reads against the substrate" />
            </SelectTrigger>
          </div>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
