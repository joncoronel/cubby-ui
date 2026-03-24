"use client";

import * as React from "react";
import {
  BaseDrawer,
  BaseDrawerClose,
  BaseDrawerDescription,
  BaseDrawerHeader,
  BaseDrawerPanel,
  BaseDrawerPopup,
  BaseDrawerTitle,
  BaseDrawerTrigger,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";

const snapPoints = ["300px", 1] as const;

export default function BaseDrawerSnapPoints() {
  const [snapPoint, setSnapPoint] = React.useState<
    (typeof snapPoints)[number] | null
  >(snapPoints[0]);

  return (
    <BaseDrawer
      snapPoints={[...snapPoints]}
      snapPoint={snapPoint}
      onSnapPointChange={(point) =>
        setSnapPoint(point as (typeof snapPoints)[number] | null)
      }
      snapToSequentialPoints
    >
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Open Snap Drawer
      </BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Snap Points</BaseDrawerTitle>
          <BaseDrawerDescription>
            Drag the drawer to snap between a compact peek and full-height view.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerPanel>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="bg-muted h-12 shrink-0 rounded-xl border"
              />
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <BaseDrawerClose render={<Button variant="outline" />}>
              Close
            </BaseDrawerClose>
          </div>
        </BaseDrawerPanel>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
