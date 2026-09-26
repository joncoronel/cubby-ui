"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Button } from "@/registry/default/button/button";

const UPDATES = [
  "Your order has shipped and is on its way to the sorting center.",
  "Your order left the sorting center and is out for delivery today.",
  "Delivered to the front door at 2:14 pm. Thanks for shopping with us.",
];

export default function TextMorphWrapping() {
  const [index, setIndex] = React.useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="max-w-64 text-sm leading-6">
        <TextMorph value={UPDATES[index]} />
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIndex((i) => (i + 1) % UPDATES.length)}
      >
        Next update
      </Button>
    </div>
  );
}
