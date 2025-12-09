import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdManualKeyCombinations() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        <Kbd>⌘</Kbd>
        <span className="text-xs">+</span>
        <Kbd>K</Kbd>
      </div>
      <div className="flex items-center gap-1">
        <Kbd>Ctrl</Kbd>
        <span className="text-xs">+</span>
        <Kbd>Shift</Kbd>
        <span className="text-xs">+</span>
        <Kbd>P</Kbd>
      </div>
      <div className="flex items-center gap-1">
        <Kbd>Alt</Kbd>
        <span className="text-xs">+</span>
        <Kbd>Tab</Kbd>
      </div>
    </div>
  )
}