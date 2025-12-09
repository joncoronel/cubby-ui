import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdKeyboardShortcutsList() {
  return (
    <div className="space-y-2 max-w-xs">
      <div className="flex items-center justify-between">
        <span className="text-sm">Open command palette</span>
        <Kbd keys={["cmd", "k"]} size="sm" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Save document</span>
        <Kbd keys={["cmd", "s"]} size="sm" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Copy selection</span>
        <Kbd keys={["cmd", "c"]} size="sm" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Paste clipboard</span>
        <Kbd keys={["cmd", "v"]} size="sm" />
      </div>
    </div>
  )
}