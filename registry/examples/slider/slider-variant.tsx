import { Slider } from "@/registry/default/slider/slider";

export default function SliderVariant() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <Slider
        variant="inset"
        defaultValue={25}
        showSteps
        markStep={25}
        getAriaLabel={() => "Inset variant"}
      />

      <Slider
        variant="bar"
        defaultValue={60}
        showSteps
        markStep={20}
        startLabel="Low"
        endLabel="High"
        getAriaLabel={() => "Bar variant"}
      />

      <Slider
        variant="squareThumb"
        defaultValue={50}
        getAriaLabel={() => "Square thumb variant"}
      />
    </div>
  );
}
