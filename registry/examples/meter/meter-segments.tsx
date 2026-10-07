import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

const STRENGTH = ["Weak", "Fair", "Good", "Strong"];

export default function MeterSegments() {
  const strength = 3;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <MeterRoot
        value={strength}
        max={4}
        low={1.5}
        high={2.5}
        optimum={4}
        getAriaValueText={(_, value) => STRENGTH[value - 1] ?? "Empty"}
      >
        <MeterLabel>Password strength</MeterLabel>
        <MeterValue>{(_, value) => STRENGTH[value - 1]}</MeterValue>
        <MeterTrack segments={4}>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      <MeterRoot value={70} size="lg" low={20} high={50} optimum={100}>
        <MeterLabel>Trackpad battery</MeterLabel>
        <MeterValue />
        <MeterTrack segments={10}>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
