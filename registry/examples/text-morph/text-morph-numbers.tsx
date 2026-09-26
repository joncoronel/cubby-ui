"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Button } from "@/registry/default/button/button";

export default function TextMorphNumbers() {
  const [balance, setBalance] = React.useState(1204.5);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="font-display flex items-baseline gap-1 text-4xl font-semibold tabular-nums">
        <span className="text-muted-foreground text-2xl">$</span>
        <TextMorph value={balance} decimals={2} />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setBalance((b) => Math.max(0, b - 95.25))}
        >
          Spend $95.25
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setBalance((b) => b + 1000)}
        >
          Add $1,000
        </Button>
      </div>
    </div>
  );
}
