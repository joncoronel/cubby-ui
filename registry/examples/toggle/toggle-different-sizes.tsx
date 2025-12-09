import { Toggle } from "@/registry/default/toggle/toggle";
import { Bold } from "lucide-react";

export default function ToggleDifferentSizes() {
  return (
    <div className="flex items-center space-x-2">
      <Toggle size="sm">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="default">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="lg">
        <Bold className="h-4 w-4" />
      </Toggle>
    </div>
  );
}