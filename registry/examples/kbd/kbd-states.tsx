import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdStates() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">Normal:</span>
        <Kbd>⌘</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Pressed:</span>
        <Kbd pressed>⌘</Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Disabled:</span>
        <Kbd disabled>⌘</Kbd>
      </div>
    </div>
  )
}