import { Slider } from "@/registry/default/slider/slider";

export default function SliderWithSteps() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <label className="text-sm font-medium">Step: 25</label>
      <Slider defaultValue={50} step={25} showSteps />
    </div>
  );
}
