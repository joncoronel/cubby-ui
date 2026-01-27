"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupCards() {
  const id = React.useId();
  const [value, setValue] = React.useState<string[]>(["pro"]);

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Basic features for personal use",
      price: 0,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Advanced features for professionals",
      price: 9,
    },
    {
      id: "team",
      name: "Team",
      description: "Collaboration features for teams",
      price: 29,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Select subscription plans</h3>
        <CheckboxGroup
          value={value}
          onValueChange={setValue}
          className="grid gap-4 md:grid-cols-3"
        >
          {plans.map((plan) => (
            <Label
              key={plan.id}
              htmlFor={`${id}-${plan.id}`}
              className="h-full gap-3 rounded-lg border bg-card p-4 has-data-checked:border-primary/50 has-data-checked:bg-muted hover:bg-muted"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {plan.description}
                  </span>
                </div>
                <Checkbox id={`${id}-${plan.id}`} value={plan.id} />
              </div>
              <span className="mt-auto text-primary font-semibold">${plan.price}/month</span>
            </Label>
          ))}
        </CheckboxGroup>
      </div>
      <div className="text-muted-foreground text-sm">
        Total: $
        {value.reduce((total, planId) => {
          const plan = plans.find((p) => p.id === planId);
          return total + (plan?.price ?? 0);
        }, 0)}
        /month
      </div>
    </div>
  );
}