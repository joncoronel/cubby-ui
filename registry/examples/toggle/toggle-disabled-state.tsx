import { Toggle } from "@/registry/default/toggle/toggle";
import { Italic } from "lucide-react";

export default function ToggleDisabledState() {
  return (
    <Toggle disabled>
      <Italic className="h-4 w-4" />
    </Toggle>
  );
}