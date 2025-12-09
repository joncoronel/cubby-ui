"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";
import { Card } from "@/registry/default/card/card";

export default function CheckboxGroupCards() {
  const [value, setValue] = React.useState<string[]>(["pro"]);

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Basic features for personal use",
      price: "$0/month",
    },
    {
      id: "pro",
      name: "Pro",
      description: "Advanced features for professionals",
      price: "$9/month",
    },
    {
      id: "team",
      name: "Team",
      description: "Collaboration features for teams",
      price: "$29/month",
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
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer p-4 hover:bg-accent",
                value.includes(plan.id) && "border-primary bg-accent"
              )}
            >
              <Label
                htmlFor={plan.id}
                className="flex cursor-pointer flex-col space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <Checkbox id={plan.id} value={plan.id} className="mt-1" />
                </div>
                <div className="font-semibold text-primary">{plan.price}</div>
              </Label>
            </Card>
          ))}
        </CheckboxGroup>
      </div>
      <div className="text-sm text-muted-foreground">
        Total: $
        {value
          .reduce((total, planId) => {
            const plan = plans.find((p) => p.id === planId);
            const price = plan?.price.match(/\d+/)?.[0] || "0";
            return total + parseInt(price);
          }, 0)}
        /month
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}