import { Badge } from "@/registry/default/badge/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, CheckIcon } from "@hugeicons/core-free-icons";

export default function BadgeWithIcons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="warning">
        <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
        Pending
      </Badge>
      <Badge variant="success">
        <HugeiconsIcon icon={CheckIcon} strokeWidth={2} />
        Completed
      </Badge>
    </div>
  );
}
