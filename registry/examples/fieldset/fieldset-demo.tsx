import {
  Field,
  FieldControl,
  FieldLabel,
} from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";

export default function FieldsetDemo() {
  return (
    <Fieldset>
      <FieldsetLegend>Shipping address</FieldsetLegend>
      <Field name="firstName">
        <FieldLabel>First name</FieldLabel>
        <FieldControl placeholder="John" />
      </Field>
      <Field name="lastName">
        <FieldLabel>Last name</FieldLabel>
        <FieldControl placeholder="Doe" />
      </Field>
      <Field name="address">
        <FieldLabel>Street address</FieldLabel>
        <FieldControl placeholder="123 Main St" />
      </Field>
    </Fieldset>
  );
}
