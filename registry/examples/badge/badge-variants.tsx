import { Badge } from "@/registry/default/badge/badge";

export default function BadgeVariants() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="danger">Destructive</Badge>
    </div>
  );
}
