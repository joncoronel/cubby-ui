import { Badge } from "@/registry/default/badge/badge";

export default function BadgeSizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className="text-xs py-0 px-2">Small</Badge>
      <Badge>Default</Badge>
      <Badge className="text-base py-1 px-3">Large</Badge>
    </div>
  );
}