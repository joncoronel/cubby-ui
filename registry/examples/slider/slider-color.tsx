import { Slider, SliderLabel } from "@/registry/default/slider/slider";

export default function SliderColor() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider defaultValue={50}>
        <SliderLabel>Neutral</SliderLabel>
      </Slider>
      <Slider color="primary" defaultValue={50}>
        <SliderLabel>Primary</SliderLabel>
      </Slider>
    </div>
  );
}
