import { Toggle } from "@/registry/default/toggle/toggle";
import { Underline } from "lucide-react";

export default function ToggleOutlineVariant() {
  return (
    <Toggle variant="outline">
      <Underline className="h-4 w-4" />
    </Toggle>
  );
}