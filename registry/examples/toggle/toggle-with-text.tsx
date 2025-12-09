import { Toggle } from "@/registry/default/toggle/toggle";
import { Bold } from "lucide-react";

export default function ToggleWithText() {
  return (
    <Toggle>
      <Bold className="h-4 w-4 mr-2" />
      Bold
    </Toggle>
  );
}