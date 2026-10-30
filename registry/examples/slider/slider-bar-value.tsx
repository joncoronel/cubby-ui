import { Slider, SliderValue } from "@/registry/default/slider/slider";

export default function SliderBarValue() {
  return (
    <Slider
      variant="bar"
      className="max-w-sm"
      defaultValue={1.45}
      min={0}
      max={3}
      step={0.05}
      format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      showSteps="hover"
      markStep={1}
      startLabel="Duration"
      endLabel={<SliderValue />}
      getAriaLabel={() => "Duration"}
    />
  );
}
