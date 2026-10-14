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
import { Slider, SliderLabel } from "@/registry/default/slider/slider";

export default function BaseDrawerSwipeIgnore() {
  return (
    <BaseDrawer>
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Open Audio Settings
      </BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Audio</BaseDrawerTitle>
          <BaseDrawerDescription>
            Drag the sliders sideways. Swipe down anywhere to dismiss.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerPanel>
          <div className="flex flex-col gap-6 py-2">
            <Slider defaultValue={70} data-base-ui-swipe-ignore="x">
              <SliderLabel>Volume</SliderLabel>
            </Slider>
            <Slider defaultValue={40} data-base-ui-swipe-ignore="x">
              <SliderLabel>Bass</SliderLabel>
            </Slider>
          </div>
        </BaseDrawerPanel>
        <BaseDrawerFooter>
          <BaseDrawerClose render={<Button className="w-full" />}>
            Done
          </BaseDrawerClose>
        </BaseDrawerFooter>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
