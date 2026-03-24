import {
  BaseDrawer,
  BaseDrawerClose,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerPanel,
  BaseDrawerPopup,
  BaseDrawerTitle,
  BaseDrawerTrigger,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";

export default function BaseDrawerNested() {
  return (
    <BaseDrawer>
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Open Drawer Stack
      </BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader className="text-center">
          <BaseDrawerTitle>First Step</BaseDrawerTitle>
          <BaseDrawerDescription>
            This is the first step. Tap the button below to continue to the next
            screen.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerFooter className="justify-center sm:justify-center">
          <BaseDrawerClose render={<Button variant="ghost" />}>
            Cancel
          </BaseDrawerClose>
          <BaseDrawer>
            <BaseDrawerTrigger render={<Button variant="outline" />}>
              Continue
            </BaseDrawerTrigger>
            <BaseDrawerPopup showBar>
              <BaseDrawerHeader className="text-center">
                <BaseDrawerTitle>Second Step</BaseDrawerTitle>
                <BaseDrawerDescription>
                  You&apos;ve reached the second step. Tap the button below to
                  continue.
                </BaseDrawerDescription>
              </BaseDrawerHeader>
              <BaseDrawerPanel>
                <div className="flex justify-center">
                  <div className="bg-muted size-48 shrink-0 rounded-xl border" />
                </div>
              </BaseDrawerPanel>
              <BaseDrawerFooter className="justify-center sm:justify-center">
                <BaseDrawerClose render={<Button variant="ghost" />}>
                  Back
                </BaseDrawerClose>
                <BaseDrawer>
                  <BaseDrawerTrigger render={<Button variant="outline" />}>
                    Continue
                  </BaseDrawerTrigger>
                  <BaseDrawerPopup showBar>
                    <BaseDrawerHeader className="text-center">
                      <BaseDrawerTitle>Third Step</BaseDrawerTitle>
                      <BaseDrawerDescription>
                        You&apos;ve reached the final step. You can close this
                        drawer or go back.
                      </BaseDrawerDescription>
                    </BaseDrawerHeader>
                    <BaseDrawerPanel>
                      <div className="flex justify-center">
                        <div className="bg-muted size-32 shrink-0 rounded-full border" />
                      </div>
                    </BaseDrawerPanel>
                  </BaseDrawerPopup>
                </BaseDrawer>
              </BaseDrawerFooter>
            </BaseDrawerPopup>
          </BaseDrawer>
        </BaseDrawerFooter>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
