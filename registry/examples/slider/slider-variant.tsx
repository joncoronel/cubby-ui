import { Slider } from "@/registry/default/slider/slider";

export default function SliderVariant() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <Slider
        variant="inset"
        defaultValue={25}
        step={25}
        showSteps
        getAriaLabel={() => "Inset variant"}
      />

      <Slider
        variant="squareThumb"
        defaultValue={50}
        getAriaLabel={() => "Square thumb variant"}
      />
    </div>
  );
}
