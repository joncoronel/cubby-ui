import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterDifferentSizes() {
  return (
    <div className="w-full max-w-[300px] space-y-4">
      <MeterRoot value={60} size="sm">
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Small</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      <MeterRoot value={60} size="md">
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Medium</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      <MeterRoot value={60} size="lg">
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Large</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
