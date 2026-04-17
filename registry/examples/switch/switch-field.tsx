import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/default/field/field";
import { Switch } from "@/registry/default/switch/switch";

export default function SwitchField() {
  return (
    <Field name="notifications">
      <FieldLabel>
        Email notifications
        <Switch defaultChecked />
      </FieldLabel>
      <FieldDescription>
        Receive email notifications when someone mentions you.
      </FieldDescription>
    </Field>
  );
}
