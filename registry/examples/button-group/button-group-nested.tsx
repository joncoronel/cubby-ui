import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";

const PAGES = [1, 2, 3, 4, 5];

export default function ButtonGroupNested() {
  return (
    <ButtonGroup aria-label="Pagination">
      <ButtonGroup>
        {PAGES.map((page) => (
          <Button
            key={page}
            size="icon"
            aria-label={`Page ${page}`}
            className="tabular-nums"
          >
            {page}
          </Button>
        ))}
      </ButtonGroup>
      <ButtonGroup>
        <Button size="icon" aria-label="Previous page">
          <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} />
        </Button>
        <Button size="icon" aria-label="Next page">
          <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
