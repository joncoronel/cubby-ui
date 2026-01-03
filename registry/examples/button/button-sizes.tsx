import { Button } from "@/registry/default/button/button";
import { Settings } from "lucide-react";

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
          <Settings />
        </Button>
        <Button variant="neutral" size="icon_sm">
          <Settings />
        </Button>
        <Button variant="neutral" size="icon">
          <Settings />
        </Button>
        <Button variant="neutral" size="icon_lg">
          <Settings />
        </Button>
      </div>
    </div>
  );
}
