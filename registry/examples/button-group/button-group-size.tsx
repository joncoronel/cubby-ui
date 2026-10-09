import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";

const SIZES = ["sm", "default", "lg"] as const;

export default function ButtonGroupSize() {
  return (
    <div className="flex flex-col items-center gap-4">
      {SIZES.map((size) => (
        <ButtonGroup key={size} size={size} aria-label="Text style">
          <Button size="icon" aria-label="Bold">
            <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
          </Button>
          <Button size="icon" aria-label="Italic">
            <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
          </Button>
          <Button size="icon" aria-label="Underline">
            <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={2} />
          </Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
