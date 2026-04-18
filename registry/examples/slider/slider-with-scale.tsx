import { Slider, SliderLabel } from "@/registry/default/slider/slider";

export default function SliderWithScale() {
  return (
    <div className="w-full max-w-sm">
      <Slider defaultValue={15} min={5} max={35}>
        <SliderLabel>Storage size</SliderLabel>
      </Slider>
      <div
        role="group"
        aria-label="Storage size reference values"
        className="text-muted-foreground mt-3 flex w-full items-center justify-between gap-1 text-xs font-medium"
      >
        <span>5 GB</span>
        <span>20 GB</span>
        <span>35 GB</span>
      </div>
    </div>
  );
}
