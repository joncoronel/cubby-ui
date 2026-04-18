import {
  Slider,
  SliderLabel,
  SliderValue,
} from "@/registry/default/slider/slider";

export default function SliderWithValue() {
  return (
    <Slider className="max-w-sm" defaultValue={75}>
      <div className="flex items-center justify-between">
        <SliderLabel>Progress</SliderLabel>
        <SliderValue />
      </div>
    </Slider>
  );
}
