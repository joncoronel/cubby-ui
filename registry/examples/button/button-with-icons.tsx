import { Button } from "@/registry/default/button/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Copy01Icon,
  Download01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
export default function ButtonWithIcons() {
  return (
    <div className="flex flex-col gap-4">
      {/* Icon-only buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="icon">
          <HugeiconsIcon icon={Settings01Icon}  strokeWidth={2} />
        </Button>
        <Button size="icon" variant="outline">
          <HugeiconsIcon icon={Copy01Icon}  strokeWidth={2} />
        </Button>
        <Button size="icon" variant="ghost">
          <HugeiconsIcon icon={Download01Icon}  strokeWidth={2} />
        </Button>
      </div>

      {/* Text with icons (automatic padding) */}
      <div className="flex flex-wrap gap-2">
        <Button leftSection={<HugeiconsIcon icon={Settings01Icon}  strokeWidth={2} />}>Settings</Button>
        <Button leftSection={<HugeiconsIcon icon={Copy01Icon}  strokeWidth={2} />} variant="outline">
          Copy
        </Button>
        <Button rightSection={<HugeiconsIcon icon={ArrowRight01Icon}  strokeWidth={2} />} variant="secondary">
          Download
        </Button>
      </div>
    </div>
  );
}
