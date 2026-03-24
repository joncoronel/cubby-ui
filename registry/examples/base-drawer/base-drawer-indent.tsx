"use client";

import {
  BaseDrawer,
  BaseDrawerClose,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerIndent,
  BaseDrawerIndentBackground,
  BaseDrawerPopup,
  BaseDrawerProvider,
  BaseDrawerTitle,
  BaseDrawerTrigger,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";

export default function BaseDrawerIndentExample() {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <BaseDrawerProvider>
        <BaseDrawerIndentBackground className="absolute" />
        <BaseDrawerIndent className="relative flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border bg-white p-8 dark:bg-gray-950">
          <p className="text-muted-foreground text-sm">
            The content behind the drawer scales and rounds when the drawer
            opens.
          </p>
          <BaseDrawer>
            <BaseDrawerTrigger render={<Button variant="outline" />}>
              Open with Indent Effect
            </BaseDrawerTrigger>
            <BaseDrawerPopup showBar>
              <BaseDrawerHeader>
                <BaseDrawerTitle>Indent Effect</BaseDrawerTitle>
                <BaseDrawerDescription>
                  The background content scales down and rounds its corners to
                  create a layered effect.
                </BaseDrawerDescription>
              </BaseDrawerHeader>
              <BaseDrawerFooter>
                <BaseDrawerClose render={<Button variant="outline" />}>
                  Close
                </BaseDrawerClose>
              </BaseDrawerFooter>
            </BaseDrawerPopup>
          </BaseDrawer>
        </BaseDrawerIndent>
      </BaseDrawerProvider>
    </div>
  );
}
