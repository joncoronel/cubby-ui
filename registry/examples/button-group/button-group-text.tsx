"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";

export default function ButtonGroupTextExample() {
  const [page, setPage] = React.useState(1);
  const totalPages = 24;

  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} />
      </Button>
      <ButtonGroupText>
        Page {page} of {totalPages}
      </ButtonGroupText>
      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      >
        <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
