import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";
export default function ButtonSizes() {
  return (
    <div className="flex flex-col flex-wrap gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <Button variant="neutral" size="xs">
          Label
        </Button>
        <Button variant="neutral" size="sm">
          Label
        </Button>
        <Button variant="neutral">Label</Button>
        <Button variant="neutral" size="lg">
          Label
        </Button>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Button variant="neutral" size="icon_xs">
          <HugeiconsIcon icon={Settings01Icon}  strokeWidth={2} />
        </Button>
        <Button variant="neutral" size="icon_sm">
          <HugeiconsIcon icon={Settings01Icon}  strokeWidth={2} />
        </Button>
        <Button variant="neutral" size="icon">
          <HugeiconsIcon icon={Settings01Icon}  strokeWidth={2} />
        </Button>
        <Button variant="neutral" size="icon_lg">
          <HugeiconsIcon icon={Settings01Icon}  strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
