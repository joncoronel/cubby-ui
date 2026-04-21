import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";
import { Input } from "@/registry/default/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";

import { HugeiconsIcon } from "@hugeicons/react";
import { Sent02Icon } from "@hugeicons/core-free-icons";
export default function ButtonGroupSelect() {
  return (
    <ButtonGroup>
      <Select defaultValue="usd">
        <SelectTrigger aria-label="Select currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="usd">USD</SelectItem>
          <SelectItem value="eur">EUR</SelectItem>
          <SelectItem value="gbp">GBP</SelectItem>
        </SelectContent>
      </Select>

      <Input type="number" placeholder="0.00" />

      <Button size="icon" aria-label="Send" variant="outline">
        <HugeiconsIcon icon={Sent02Icon}  strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
