import { Kbd } from "@/registry/default/kbd/kbd";

const NAMED_KEYS = [
  "mod",
  "ctrl",
  "alt",
  "shift",
  "enter",
  "backspace",
  "tab",
  "esc",
  "space",
  "up",
  "down",
  "left",
  "right",
];

export default function KbdSpecialKeysWithAutoConversion() {
  return (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[auto_auto_auto_auto] sm:gap-x-6">
      {NAMED_KEYS.map((key) => (
        <div key={key} className="contents">
          <code className="text-muted-foreground text-xs">{key}</code>
          <Kbd keys={[key]} className="justify-self-start" />
        </div>
      ))}
    </div>
  );
}
