import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";

// The key is decoration here: `aria-keyshortcuts` names the shortcut, so the
// button is still announced as just "Save".
export default function KbdInButton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        aria-keyshortcuts="Meta+S Control+S"
        trailingIcon={<Kbd size="sm" keys={["mod", "s"]} aria-hidden />}
      >
        Save
      </Button>
      <Button
        variant="destructive"
        aria-keyshortcuts="Meta+Backspace Control+Backspace"
        trailingIcon={<Kbd size="sm" keys={["mod", "backspace"]} aria-hidden />}
      >
        Delete
      </Button>
      <Button
        variant="outline"
        aria-keyshortcuts="Meta+K Control+K"
        trailingIcon={<Kbd size="sm" keys={["mod", "k"]} aria-hidden />}
      >
        Search
      </Button>
    </div>
  );
}
