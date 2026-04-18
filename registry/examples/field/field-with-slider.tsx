import {
  Field,
  FieldDescription,
} from "@/registry/default/field/field";
import { Slider, SliderLabel, SliderValue } from "@/registry/default/slider/slider";

export default function FieldWithSlider() {
  return (
    <Field name="volume">
      <Slider defaultValue={[50]} className="w-full max-w-xs">
        <div className="flex items-center justify-between">
          <SliderLabel>Volume</SliderLabel>
          <SliderValue />
        </div>
      </Slider>
      <FieldDescription>Adjust the output volume level.</FieldDescription>
    </Field>
  );
}
