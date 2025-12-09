import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdPlatformDetection() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">Auto:</span>
        <Kbd keys={["cmd", "k"]} platform="auto" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Mac:</span>
        <Kbd keys={["cmd", "k"]} platform="mac" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Windows:</span>
        <Kbd keys={["cmd", "k"]} platform="windows" />
      </div>
    </div>
  )
}