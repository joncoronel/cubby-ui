"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/registry/default/select/select";

export default function SelectObjectValues() {
  return (
    <Select
      defaultValue={shippingMethods[0]}
      itemToStringValue={(method) => method?.id ?? ""}
    >
      <SelectTrigger className="h-auto min-h-10 w-[280px] sm:h-auto sm:min-h-9">
        <SelectValue>
          {(method: ShippingMethod) => (
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-sm leading-5">{method.name}</span>
              <span className="text-muted-foreground text-xs leading-4">
                {method.duration} ({method.price})
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {shippingMethods.map((method) => (
          <SelectItem key={method.id} value={method} className="items-start">
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-sm leading-5">{method.name}</span>
              <span className="text-muted-foreground text-xs leading-4">
                {method.duration} ({method.price})
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface ShippingMethod {
  id: string;
  name: string;
  duration: string;
  price: string;
}

const shippingMethods: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard",
    duration: "Delivers in 4-6 business days",
    price: "$4.99",
  },
  {
    id: "express",
    name: "Express",
    duration: "Delivers in 2-3 business days",
    price: "$9.99",
  },
  {
    id: "overnight",
    name: "Overnight",
    duration: "Delivers next business day",
    price: "$19.99",
  },
];
