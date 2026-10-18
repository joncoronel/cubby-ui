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

export default function SelectOutline() {
  return (
    <Select items={items}>
      <div className="flex flex-col gap-1">
        <SelectLabel>Fruit</SelectLabel>
        <SelectTrigger variant="outline" className="w-[220px]">
          <SelectValue placeholder="Select a fruit" />
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
  );
}
