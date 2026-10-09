import { Button } from "@/registry/default/button/button";
import { ButtonGroup } from "@/registry/default/button-group/button-group";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive02Icon,
  ArrowTurnForwardIcon,
  Clock01Icon,
  Delete02Icon,
  MailReply01Icon,
} from "@hugeicons/core-free-icons";

export default function ButtonGroupEmphasis() {
  return (
    <ButtonGroup aria-label="Message actions" className="[--radius:9999px]">
      <Button
        variant="secondary"
        leadingIcon={<HugeiconsIcon icon={MailReply01Icon} strokeWidth={2} />}
      >
        Reply
      </Button>
      <Button size="icon" aria-label="Forward">
        <HugeiconsIcon icon={ArrowTurnForwardIcon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Archive">
        <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Snooze">
        <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
      </Button>
      <Button size="icon" aria-label="Delete">
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
      </Button>
    </ButtonGroup>
  );
}
