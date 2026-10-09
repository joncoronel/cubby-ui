import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
} from "@/registry/default/number-field/number-field";

const FIELDS = [
  { prefix: "W", label: "Width", value: 320 },
  { prefix: "H", label: "Height", value: 180 },
  { prefix: "°", label: "Rotation", value: 0 },
];

export default function NumberFieldScrubInline() {
  return (
    <div className="flex flex-wrap gap-2">
      {FIELDS.map((field) => (
        <NumberField key={field.label} defaultValue={field.value}>
          <NumberFieldGroup size="sm">
            <NumberFieldScrubArea>
              <span aria-hidden>{field.prefix}</span>
              <NumberFieldScrubAreaCursor />
            </NumberFieldScrubArea>
            <NumberFieldInput aria-label={field.label} className="w-14" />
          </NumberFieldGroup>
        </NumberField>
      ))}
    </div>
  );
}
