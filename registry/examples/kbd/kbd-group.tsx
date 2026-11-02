import { Kbd, KbdGroup } from "@/registry/default/kbd/kbd";

export default function KbdGroupExample() {
  return (
    <div className="flex flex-col items-start gap-3">
      <KbdGroup>
        <Kbd keys={["mod"]} />
        <Kbd keys={["shift"]} />
        <Kbd>P</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>Alt</Kbd>
        <span>+</span>
        <Kbd>Del</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>G</Kbd>
        <span>then</span>
        <Kbd>D</Kbd>
      </KbdGroup>
    </div>
  );
}
