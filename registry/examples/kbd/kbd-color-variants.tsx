import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdColorVariants() {
  return (
    <div className="flex gap-2">
      <Kbd variant="default">⌘</Kbd>
      <Kbd variant="primary">⌘</Kbd>
      <Kbd variant="secondary">⌘</Kbd>
      <Kbd variant="outline">⌘</Kbd>
      <Kbd variant="ghost">⌘</Kbd>
      <Kbd variant="danger">⌘</Kbd>
    </div>
  )
}