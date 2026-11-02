import { Button } from "@/registry/default/button/button";
import { Kbd } from "@/registry/default/kbd/kbd";

export default function KbdInButton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button trailingIcon={<Kbd size="sm" keys={["mod", "s"]} />}>Save</Button>
      <Button
        variant="destructive"
        trailingIcon={<Kbd size="sm" keys={["mod", "backspace"]} />}
      >
        Delete
      </Button>
      <Button
        variant="outline"
        trailingIcon={<Kbd size="sm" keys={["mod", "k"]} />}
      >
        Search
      </Button>
    </div>
  );
}
