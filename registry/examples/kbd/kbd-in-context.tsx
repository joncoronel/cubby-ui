import { Kbd, KbdGroup } from "@/registry/default/kbd/kbd";

export default function KbdInContext() {
  return (
    <div className="max-w-sm space-y-2 text-sm">
      <p>
        Press <Kbd keys={["mod", "k"]} /> to open the command palette.
      </p>
      <p>
        Use{" "}
        <KbdGroup>
          <Kbd keys={["up"]} />
          <Kbd keys={["down"]} />
        </KbdGroup>{" "}
        to move and <Kbd keys={["enter"]} /> to pick.
      </p>
      <p>
        Press <Kbd keys={["esc"]} /> to close any dialog.
      </p>
    </div>
  );
}
