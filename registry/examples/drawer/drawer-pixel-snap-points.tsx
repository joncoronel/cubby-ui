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

const menuItems = [
  { id: 1, label: "Profile", description: "View and edit your profile" },
  { id: 2, label: "Settings", description: "Manage app preferences" },
  { id: 3, label: "Notifications", description: "Configure alerts" },
  { id: 4, label: "Privacy", description: "Control your data" },
  { id: 5, label: "Security", description: "Passwords and 2FA" },
  { id: 6, label: "Appearance", description: "Theme and display" },
  { id: 7, label: "Language", description: "Change language" },
  { id: 8, label: "Help", description: "Get support" },
];

export default function DrawerPixelSnapPoints() {
  const [snap, setSnap] = React.useState<SnapPoint>("200px");

  return (
    <Drawer
      snapPoints={["200px", "400px", 1]}
      activeSnapPoint={snap}
      onActiveSnapPointChange={setSnap}
    >
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Drawer with Pixel Snap Points
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Settings Menu</DrawerTitle>
          <DrawerDescription>
            Snaps to fixed heights: 200px, 400px, or full.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-muted-foreground mb-3 text-xs">
            Current: {snap === 1 ? "Full" : snap}
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSnap("200px")}
            >
              200px
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSnap("400px")}
            >
              400px
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSnap(1)}
            >
              Full
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className="hover:bg-muted/50 flex flex-col items-start rounded-lg border p-3 text-left transition-colors"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground text-sm">
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
