import { Field, FieldItem, FieldLabel } from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/default/radio-group/radio-group";

export default function FieldsetWithRadioGroup() {
  return (
    <Field name="notifications">
      <Fieldset render={<RadioGroup defaultValue="all" />}>
        <FieldsetLegend>Notification preferences</FieldsetLegend>
        <FieldItem>
          <FieldLabel>
            <RadioGroupItem value="all" />
            All notifications
          </FieldLabel>
        </FieldItem>
        <FieldItem>
          <FieldLabel>
            <RadioGroupItem value="mentions" />
            Mentions only
          </FieldLabel>
        </FieldItem>
        <FieldItem>
          <FieldLabel>
            <RadioGroupItem value="none" />
            None
          </FieldLabel>
        </FieldItem>
      </Fieldset>
    </Field>
  );
}
