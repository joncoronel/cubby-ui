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
const currencies = [
  { label: "USD", value: "usd" },
  { label: "EUR", value: "eur" },
  { label: "GBP", value: "gbp" },
];

export default function ButtonGroupSelect() {
  return (
    <ButtonGroup variant="attached">
      <Select items={currencies} defaultValue="usd">
        <SelectTrigger variant="outline" aria-label="Select currency">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.value} value={currency.value}>
              {currency.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input variant="outline" type="number" placeholder="0.00" />

      <Button size="icon" aria-label="Send" variant="outline">
        <HugeiconsIcon icon={Sent02Icon} strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
