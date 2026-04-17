import {
  Field,
  FieldControl,
  FieldDescription,
  FieldLabel,
} from "@/registry/default/field/field";

export default function FieldDisabled() {
  return (
    <Field name="username" disabled>
      <FieldLabel>Username</FieldLabel>
      <FieldControl defaultValue="johndoe" />
      <FieldDescription>
        Contact an administrator to change your username.
      </FieldDescription>
    </Field>
  );
}
