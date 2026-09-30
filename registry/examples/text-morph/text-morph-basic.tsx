"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Button } from "@/registry/default/button/button";

const WORDS = ["Design", "Develop", "Deploy", "Delight"];

export default function TextMorphBasic() {
  const [index, setIndex] = React.useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <TextMorph
        value={WORDS[index]}
        className="font-display text-4xl font-semibold tracking-tight"
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIndex((i) => (i + 1) % WORDS.length)}
      >
        Next word
      </Button>
    </div>
  );
}
