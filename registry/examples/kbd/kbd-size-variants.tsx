import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdSizeVariants() {
  return (
    <div className="flex items-center gap-2">
      <Kbd size="sm">⌘</Kbd>
      <Kbd size="md">⌘</Kbd>
      <Kbd size="lg">⌘</Kbd>
    </div>
  )
}