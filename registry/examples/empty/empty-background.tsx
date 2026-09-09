import { HugeiconsIcon } from "@hugeicons/react";
import Notification01Icon from "@hugeicons/core-free-icons/Notification01Icon";
import Refresh01Icon from "@hugeicons/core-free-icons/Refresh01Icon";

import { Button } from "@/registry/default/button/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/default/empty/empty";

export default function EmptyBackground() {
  return (
    <Empty className="bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No Notifications</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          You&apos;re all caught up. New notifications will appear here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          leadingIcon={<HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} />}
        >
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  );
}
