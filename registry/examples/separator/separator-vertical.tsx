import { Separator } from "@/registry/default/separator/separator";

export default function SeparatorVertical() {
  return (
    <div className="flex h-24 items-center justify-center space-x-4">
      <div className="text-center">
        <div className="text-2xl font-bold">50K+</div>
        <div className="text-muted-foreground text-sm">Users</div>
      </div>
      <Separator orientation="vertical" className="h-16" />
      <div className="text-center">
        <div className="text-2xl font-bold">100K+</div>
        <div className="text-muted-foreground text-sm">Downloads</div>
      </div>
      <Separator orientation="vertical" className="h-16" />
      <div className="text-center">
        <div className="text-2xl font-bold">4.8</div>
        <div className="text-muted-foreground text-sm">Rating</div>
      </div>
    </div>
  );
}
