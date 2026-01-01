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

const product = {
  name: "Minimalist Desk Lamp",
  price: 89,
  rating: 4.8,
  reviews: 124,
  description:
    "A sleek, adjustable LED desk lamp with touch-sensitive controls and three color temperature modes. Perfect for home offices and workspaces.",
  features: [
    "Adjustable arm and head",
    "Touch-sensitive dimming",
    "3 color temperatures",
    "USB charging port",
    "Memory function",
  ],
  specs: [
    { label: "Material", value: "Aluminum alloy" },
    { label: "Power", value: "12W LED" },
    { label: "Color temps", value: "3000K / 4500K / 6000K" },
    { label: "Dimensions", value: '18" H × 6" base' },
  ],
};

export default function DrawerSnapPoints() {
  const [snap, setSnap] = React.useState<SnapPoint>(0.5);

  return (
    <Drawer
      snapPoints={[0.5, 1]}
      activeSnapPoint={snap}
      onActiveSnapPointChange={setSnap}
    >
      <DrawerTrigger render={<Button variant="outline" />}>
        View Product
      </DrawerTrigger>
      <DrawerContent className={"max-w-3xl"}>
        <DrawerHandle />
        <DrawerHeader>
          <div className="flex items-start gap-4">
            <div className="bg-muted flex size-20 shrink-0 items-center justify-center rounded-lg">
              <svg
                className="text-muted-foreground size-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <DrawerTitle>{product.name}</DrawerTitle>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <svg
                    className="size-4 fill-yellow-400 text-yellow-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ({product.reviews} reviews)
                </span>
              </div>
              <p className="mt-2 text-xl font-bold">${product.price}</p>
            </div>
          </div>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button className="flex-1">Add to Cart</Button>
            <Button variant="outline" size="icon">
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 font-medium">Description</h3>
            <p className="text-muted-foreground text-sm">
              {product.description}
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 font-medium">Features</h3>
            <ul className="flex flex-col gap-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <svg
                    className="text-primary size-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 font-medium">Specifications</h3>
            <div className="flex flex-col gap-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
