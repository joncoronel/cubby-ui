"use client";

import * as React from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type SnapPoint,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";

const cards = [
  {
    id: 1,
    title: "Card 1",
    content: "This is the content of card 1",
  },
  {
    id: 2,
    title: "Card 2",
    content: "This is the content of card 2",
  },
  {
    id: 3,
    title: "Card 3",
    content: "This is the content of card 3",
  },
  {
    id: 4,
    title: "Card 4",
    content: "This is the content of card 4",
  },
  {
    id: 5,
    title: "Card 5",
    content: "This is the content of card 5",
  },
  {
    id: 6,
    title: "Card 6",
    content: "This is the content of card 6",
  },
  {
    id: 7,
    title: "Card 7",
    content: "This is the content of card 7",
  },
];

export default function DrawerSnapPoints() {
  const [snap, setSnap] = React.useState<SnapPoint>(0.5);

  return (
    <Drawer
      snapPoints={[0.5, 1]}
      activeSnapPoint={snap}
      onActiveSnapPointChange={setSnap}
    >
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Drawer with Snap Points
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Multi-Snap Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer has snap points at 58% and 100%. Current:{" "}
            {snap === 1 ? "Full" : `${(snap as number) * 100}%`}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-card flex flex-col gap-2 rounded-lg p-4"
            >
              <h3 className="text-lg font-bold">{card.title}</h3>
              <p className="text-muted-foreground text-sm">{card.content}</p>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
