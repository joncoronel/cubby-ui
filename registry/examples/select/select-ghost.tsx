import { Button } from "@/registry/default/button/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/registry/default/select/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon } from "@hugeicons/core-free-icons";

const fonts = [
  { label: "Geist", value: "geist" },
  { label: "Georgia", value: "georgia" },
  { label: "Menlo", value: "menlo" },
];

export default function SelectGhost() {
  return (
    <div className="flex items-center gap-1">
      <Select items={fonts} defaultValue="geist">
        <SelectTrigger variant="ghost" size="sm" aria-label="Font">
          <SelectValue />
        </SelectTrigger>
        <SelectContent size="sm">
          {fonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon_sm" aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
      </Button>
      <Button variant="ghost" size="icon_sm" aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
      </Button>
    </div>
  );
}
