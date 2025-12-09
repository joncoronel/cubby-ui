import { SendIcon } from "lucide-react";

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
        <SendIcon />
      </Button>
    </ButtonGroup>
  );
}
