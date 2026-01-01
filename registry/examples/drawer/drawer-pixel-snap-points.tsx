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

const cartItems = [
  { id: 1, name: "Wireless Headphones", price: 149.99, qty: 1 },
  { id: 2, name: "Phone Case", price: 29.99, qty: 2 },
  { id: 3, name: "USB-C Cable", price: 19.99, qty: 1 },
  { id: 4, name: "Laptop Stand", price: 79.99, qty: 1 },
];

const subtotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.qty,
  0,
);
const shipping = 5.99;
const tax = subtotal * 0.08;
const total = subtotal + shipping + tax;

export default function DrawerPixelSnapPoints() {
  const [snap, setSnap] = React.useState<SnapPoint>("200px");

  return (
    <Drawer
      snapPoints={["200px", "400px", 1]}
      activeSnapPoint={snap}
      onActiveSnapPointChange={setSnap}
    >
      <DrawerTrigger render={<Button variant="outline" />}>
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Cart ({cartItems.length})
      </DrawerTrigger>
      <DrawerContent className={"max-w-3xl"}>
        <DrawerHandle />
        <DrawerHeader>
          <DrawerTitle>Your Cart</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
              <p className="text-muted-foreground text-sm">
                {cartItems.length} items
              </p>
            </div>
            <Button>Checkout</Button>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-md">
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Qty: {item.qty}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="border-input bg-background placeholder:text-muted-foreground flex-1 rounded-md border px-3 py-2 text-sm"
              />
              <Button variant="outline">Apply</Button>
            </div>
          </div>

          <div className="mt-4">
            <Button className="w-full">Proceed to Checkout</Button>
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Free shipping on orders over $100
            </p>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
