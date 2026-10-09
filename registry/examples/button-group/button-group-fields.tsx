import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/default/button-group/button-group";
import { Input } from "@/registry/default/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

const STATUSES = [
  { label: "Open", value: "open" },
  { label: "In progress", value: "in-progress" },
  { label: "Closed", value: "closed" },
];

export default function ButtonGroupFields() {
  return (
    <ButtonGroup aria-label="Issues">
      <Input
        aria-label="Search issues"
        placeholder="Search issues…"
        className="w-44"
      />
      <ButtonGroupSeparator />
      <Select items={STATUSES} defaultValue="open">
        <SelectTrigger aria-label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ButtonGroupSeparator />
      <Button
        leadingIcon={<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />}
      >
        New issue
      </Button>
    </ButtonGroup>
  );
}
