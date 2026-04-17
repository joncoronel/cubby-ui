import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "@/registry/default/field/field";

export default function FieldWithDescription() {
  return (
    <Field name="email">
      <FieldLabel>Email address</FieldLabel>
      <FieldControl type="email" placeholder="you@example.com" />
      <FieldDescription>
        We&apos;ll never share your email with anyone else.
      </FieldDescription>
    </Field>
  );
}
