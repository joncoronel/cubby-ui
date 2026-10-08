import {
  type MeterStatus,
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

const STATUS_TEXT: Record<MeterStatus, string> = {
  optimum: "good",
  suboptimum: "fair",
  critical: "critical",
};

// Color isn't announced, so screen readers hear the status too
function withStatus(formatted: string, _: number, status?: MeterStatus) {
  return status ? `${formatted}, ${STATUS_TEXT[status]}` : formatted;
}

export default function MeterThresholds() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Lower is better: optimum sits in the low region */}
      <MeterRoot
        value={91}
        low={60}
        high={85}
        optimum={0}
        getAriaValueText={withStatus}
      >
        <MeterLabel>Disk usage</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      {/* Higher is better: optimum sits in the high region */}
      <MeterRoot
        value={34}
        low={20}
        high={50}
        optimum={100}
        getAriaValueText={withStatus}
      >
        <MeterLabel>Battery</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      {/* Middle is best: optimum sits between low and high */}
      <MeterRoot
        value={46}
        low={30}
        high={60}
        optimum={45}
        getAriaValueText={withStatus}
      >
        <MeterLabel>Humidity</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
