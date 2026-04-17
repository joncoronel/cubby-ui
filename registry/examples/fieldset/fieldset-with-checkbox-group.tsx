import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import {
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
} from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";

export default function FieldsetWithCheckboxGroup() {
  return (
    <Field name="permissions">
      <Fieldset render={<CheckboxGroup defaultValue={["read"]} />}>
        <FieldsetLegend>Permissions</FieldsetLegend>
        <FieldItem>
          <FieldLabel>
            <Checkbox value="read" />
            Read
          </FieldLabel>
        </FieldItem>
        <FieldItem>
          <FieldLabel>
            <Checkbox value="write" />
            Write
          </FieldLabel>
        </FieldItem>
        <FieldItem>
          <FieldLabel>
            <Checkbox value="admin" />
            Admin
          </FieldLabel>
        </FieldItem>
        <FieldDescription>
          Select which permissions to grant this user.
        </FieldDescription>
      </Fieldset>
    </Field>
  );
}
