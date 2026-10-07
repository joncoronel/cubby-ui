import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterThresholds() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Lower is better: optimum sits in the low region */}
      <MeterRoot value={91} low={60} high={85} optimum={0}>
        <MeterLabel>Disk usage</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      {/* Higher is better: optimum sits in the high region */}
      <MeterRoot value={34} low={20} high={50} optimum={100}>
        <MeterLabel>Battery</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      {/* Middle is best: optimum sits between low and high */}
      <MeterRoot value={46} low={30} high={60} optimum={45}>
        <MeterLabel>Humidity</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
