import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterFormat() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <MeterRoot
        value={1840}
        max={2500}
        format={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
        low={1500}
        high={2250}
        optimum={0}
        getAriaValueText={(formatted) => `${formatted} of $2,500`}
      >
        <MeterLabel>Monthly cloud spend</MeterLabel>
        <MeterValue>{(formatted) => `${formatted} of $2,500`}</MeterValue>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>

      <MeterRoot
        value={4.6}
        min={1}
        max={5}
        format={{ maximumFractionDigits: 1 }}
        getAriaValueText={(formatted) => `${formatted} out of 5`}
      >
        <MeterLabel>Average rating</MeterLabel>
        <MeterValue>{(formatted) => `${formatted} / 5`}</MeterValue>
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </MeterRoot>
    </div>
  );
}
