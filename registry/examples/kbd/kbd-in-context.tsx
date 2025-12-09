import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdInContext() {
  return (
    <div className="space-y-2">
      <p className="text-sm">
        Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette
      </p>
      <p className="text-sm">
        Use <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate and <Kbd>↵</Kbd> to select
      </p>
      <p className="text-sm">
        Press <Kbd>Esc</Kbd> to close any dialog
      </p>
    </div>
  )
}