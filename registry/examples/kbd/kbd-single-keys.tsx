import { Kbd } from "@/registry/default/kbd/kbd";

export default function KbdSingleKeys() {
  return (
    <div className="flex items-center gap-2">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>↵</Kbd>
    </div>
  );
}
