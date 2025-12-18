"use client";

import * as React from "react";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type SnapPoint,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";

export default function DrawerSequentialSnap() {
  const [snap, setSnap] = React.useState<SnapPoint>(0.25);

  return (
    <Drawer
      snapPoints={[0.25, 0.5, 0.75, 1]}
      activeSnapPoint={snap}
      onActiveSnapPointChange={setSnap}
      sequentialSnap
    >
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Sequential Snap Drawer
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Sequential Snap Points</DrawerTitle>
          <DrawerDescription>
            With <code className="bg-muted rounded px-1">sequentialSnap</code>{" "}
            enabled, fast swipes cannot skip snap points. Try swiping quickly -
            the drawer will stop at each snap point.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Current snap point
            </p>
            <p className="text-2xl font-bold">
              {snap === 1 ? "100%" : `${(snap as number) * 100}%`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[0.25, 0.5, 0.75, 1].map((point) => (
              <Button
                key={point}
                variant={snap === point ? "primary" : "outline"}
                size="sm"
                onClick={() => setSnap(point)}
              >
                {point === 1 ? "100%" : `${point * 100}%`}
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            The drawer has snap points at 25%, 50%, 75%, and 100%. With
            sequential snapping, you must pass through each point - you cannot
            swipe directly from 25% to 100%.
          </p>
          {/* Spacer content to make drawer taller */}
          <div className="mt-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted/30 h-16 rounded-lg" />
            ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
