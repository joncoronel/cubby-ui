import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/registry/default/select/select";

export default function SelectAlignItemWithTrigger() {
  const items = [
    { label: "Select font", value: "select-font" },
    { label: "Times New Roman", value: "times-new-roman" },
    { label: "Arial", value: "arial" },
    { label: "Helvetica", value: "helvetica" },
    { label: "Verdana", value: "verdana" },
    { label: "Courier New", value: "courier-new" },
    { label: "Georgia", value: "georgia" },
    { label: "Palatino", value: "palatino" },
    { label: "Garamond", value: "garamond" },
    { label: "Bookman", value: "bookman" },
    { label: "Comic Sans MS", value: "comic-sans-ms" },
  ];

  return (
    <Select items={items} defaultValue="select-font">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
