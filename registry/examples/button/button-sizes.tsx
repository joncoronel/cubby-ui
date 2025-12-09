import { Button } from "@/registry/default/button/button";
import { Settings } from "lucide-react";

export default function ButtonSizes() {
  return (
    <div className="flex flex-col flex-wrap gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <Button size="xs">Label</Button>
        <Button size="sm">Label</Button>
        <Button>Label</Button>
        <Button size="lg">Label</Button>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Button size="icon_xs">
          <Settings />
        </Button>
        <Button size="icon_sm">
          <Settings />
        </Button>
        <Button size="icon">
          <Settings />
        </Button>
        <Button size="icon_lg">
          <Settings />
        </Button>
      </div>
    </div>
  );
}
