import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterWithSegments() {
  return (
    <div className="w-full max-w-[300px] space-y-6">
      {/* Step progress indicator */}
      <MeterRoot value={4} max={5}>
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Setup Progress</MeterLabel>
          <MeterValue>
            {(formattedValue, value) => `${value} of 5 steps`}
          </MeterValue>
        </div>
        <MeterTrack segments={5}>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      {/* Segments with thresholds */}
      <MeterRoot value={35} low={25} high={75}>
        <div className="flex items-center justify-between gap-2">
          <MeterLabel>Segmented with thresholds</MeterLabel>
          <MeterValue />
        </div>
        <MeterTrack segments={4}>
          <MeterIndicator />
        </MeterTrack>
        {/* <div className="text-muted-foreground mt-1 flex justify-between text-xs">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div> */}
      </MeterRoot>

      {/* Visual battery indicator */}
      <MeterRoot value={45} low={20} optimumMin={75}>
        <MeterLabel>Battery Level </MeterLabel>
        <MeterTrack segments={10} className="h-6!">
          <MeterIndicator />
        </MeterTrack>
        <MeterValue className="text-right">
          {(formattedValue, value) => `${value}% charged`}
        </MeterValue>
      </MeterRoot>
    </div>
  );
}
