"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon } from "@hugeicons/core-free-icons";

export default function ButtonLoading() {
  const [loading, setLoading] = React.useState(false);

  const simulateAction = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button loading>Saving</Button>
      <Button loading variant="outline">
        Saving
      </Button>
      <Button
        variant="secondary"
        loading={loading}
        onClick={simulateAction}
        leadingIcon={<HugeiconsIcon icon={Download01Icon} strokeWidth={2} />}
      >
        Download
      </Button>
    </div>
  );
}
