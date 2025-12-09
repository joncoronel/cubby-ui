import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdSpecialKeysWithAutoConversion() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Kbd keys={["space"]} />
      <Kbd keys={["enter"]} />
      <Kbd keys={["delete"]} />
      <Kbd keys={["backspace"]} />
      <Kbd keys={["up"]} />
      <Kbd keys={["down"]} />
      <Kbd keys={["left"]} />
      <Kbd keys={["right"]} />
      <Kbd>Home</Kbd>
      <Kbd>End</Kbd>
      <Kbd>PgUp</Kbd>
      <Kbd>PgDn</Kbd>
    </div>
  )
}