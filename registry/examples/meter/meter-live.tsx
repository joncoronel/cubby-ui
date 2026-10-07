"use client";

import * as React from "react";
import {
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
} from "@/registry/default/meter/meter";

export default function MeterLive() {
  const [load, setLoad] = React.useState(42);

  // A random walk with the occasional spike
  React.useEffect(() => {
    const timer = setInterval(() => {
      setLoad((prev) => {
        const spike = Math.random() < 0.15 ? 30 : 0;
        const next = prev + (Math.random() - 0.55) * 18 + spike;
        return Math.round(Math.min(100, Math.max(4, next)));
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <MeterRoot value={load} low={50} high={80} optimum={0} className="max-w-sm">
      <MeterLabel>CPU load</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </MeterRoot>
  );
}
