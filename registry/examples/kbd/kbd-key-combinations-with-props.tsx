import { Kbd } from "@/registry/default/kbd/kbd"

export default function KbdKeyCombinationsWithProps() {
  return (
    <div className="flex gap-4 flex-wrap">
      <Kbd keys={["cmd", "k"]} />
      <Kbd keys={["ctrl", "shift", "p"]} />
      <Kbd keys={["alt", "tab"]} />
      <Kbd keys={["cmd", "k"]} separator=" + " />
    </div>
  )
}