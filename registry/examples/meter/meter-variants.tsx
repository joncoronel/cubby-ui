import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterVariants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <MeterRoot value={64}>
        <MeterLabel>Default</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      <MeterRoot value={64} variant="neutral">
        <MeterLabel>Neutral</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
