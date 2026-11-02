import { Kbd } from "@/registry/default/kbd/kbd";

const SHORTCUTS = [
  { label: "Open command palette", keys: ["mod", "k"] },
  { label: "Save document", keys: ["mod", "s"] },
  { label: "Find and replace", keys: ["mod", "alt", "f"] },
  { label: "Toggle sidebar", keys: ["mod", "b"] },
];

export default function KbdKeyboardShortcutsList() {
  return (
    <dl className="w-full max-w-xs space-y-2.5 text-sm">
      {SHORTCUTS.map((shortcut) => (
        <div
          key={shortcut.label}
          className="flex items-center justify-between gap-4"
        >
          <dt>{shortcut.label}</dt>
          <dd>
            <Kbd keys={shortcut.keys} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
