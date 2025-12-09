import { Button } from "@/registry/default/button/button";
import { Settings, Copy, Download, ArrowRight } from "lucide-react";

export default function ButtonWithIcons() {
  return (
    <div className="flex flex-col gap-4">
      {/* Icon-only buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="icon">
          <Settings />
        </Button>
        <Button size="icon" variant="outline">
          <Copy />
        </Button>
        <Button size="icon" variant="ghost">
          <Download />
        </Button>
      </div>

      {/* Text with icons (automatic padding) */}
      <div className="flex flex-wrap gap-2">
        <Button leftSection={<Settings />}>Settings</Button>
        <Button leftSection={<Copy />} variant="outline">
          Copy
        </Button>
        <Button rightSection={<ArrowRight />} variant="secondary">
          Download
        </Button>
      </div>
    </div>
  );
}
