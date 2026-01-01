"use client";

import * as React from "react";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type SnapPoint,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";

const location = {
  name: "Golden Gate Park",
  type: "Park",
  rating: 4.8,
  reviews: 12847,
  distance: "2.3 mi",
  hours: "Open 24 hours",
  address: "501 Stanyan St, San Francisco, CA 94117",
  phone: "(415) 831-2700",
  description:
    "A large urban park consisting of 1,017 acres of public grounds. The park features several attractions including botanical gardens, museums, and recreational areas.",
  features: ["Restrooms", "Parking", "Accessible", "Pet Friendly"],
  photos: [1, 2, 3, 4, 5, 6],
};

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
        View Location
      </DrawerTrigger>
      <DrawerContent className={"max-w-3xl"}>
        <DrawerHandle />
        <DrawerHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <DrawerTitle>{location.name}</DrawerTitle>
              <p className="text-muted-foreground text-sm">{location.type}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <svg
                  className="size-4 fill-yellow-400 text-yellow-400"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-medium">{location.rating}</span>
                <span className="text-muted-foreground text-sm">
                  ({location.reviews.toLocaleString()})
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                {location.distance}
              </p>
            </div>
          </div>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button className="flex-1">
              <svg
                className="mr-2 size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Directions
            </Button>
            <Button variant="outline" className="flex-1">
              <svg
                className="mr-2 size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              Save
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <svg
                  className="text-muted-foreground size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">{location.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="text-muted-foreground size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span className="text-sm">{location.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  className="text-muted-foreground size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm">{location.phone}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 font-medium">About</h3>
            <p className="text-muted-foreground text-sm">
              {location.description}
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Features</h3>
            <div className="flex flex-wrap gap-2">
              {location.features.map((feature) => (
                <span
                  key={feature}
                  className="bg-muted rounded-full px-3 py-1 text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 font-medium">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {location.photos.map((photo) => (
                <div
                  key={photo}
                  className="bg-muted aspect-square rounded-lg"
                />
              ))}
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
