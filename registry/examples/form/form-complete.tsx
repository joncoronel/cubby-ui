"use client";

import { Button } from "@/registry/default/button/button";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
} from "@/registry/default/field/field";
import { Fieldset, FieldsetLegend } from "@/registry/default/fieldset/fieldset";
import { Form } from "@/registry/default/form/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/default/radio-group/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";
import { Switch } from "@/registry/default/switch/switch";

const departments = [
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
];

export default function FormComplete() {
  return (
    <Form
      className="w-full max-w-md space-y-5"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="fullName">
        <FieldLabel>Full name</FieldLabel>
        <FieldControl required placeholder="Jane Doe" />
        <FieldError match="valueMissing">Please enter your name</FieldError>
      </Field>

      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl type="email" required placeholder="jane@company.com" />
        <FieldError match="valueMissing">Email is required</FieldError>
        <FieldError match="typeMismatch">
          Please enter a valid email address
        </FieldError>
      </Field>

      <Field name="department">
        <Select items={departments} required>
          <div className="flex flex-col gap-1">
            <SelectLabel>Department</SelectLabel>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
          </div>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError />
      </Field>

      <Field name="role">
        <Fieldset render={<RadioGroup defaultValue="member" />}>
          <FieldsetLegend>Role</FieldsetLegend>
          <FieldItem>
            <FieldLabel>
              <RadioGroupItem value="member" />
              Member
            </FieldLabel>
          </FieldItem>
          <FieldItem>
            <FieldLabel>
              <RadioGroupItem value="lead" />
              Team Lead
            </FieldLabel>
          </FieldItem>
          <FieldItem>
            <FieldLabel>
              <RadioGroupItem value="manager" />
              Manager
            </FieldLabel>
          </FieldItem>
        </Fieldset>
      </Field>

      <Field name="skills">
        <Fieldset render={<CheckboxGroup defaultValue={[]} />}>
          <FieldsetLegend>Skills</FieldsetLegend>
          {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
            <FieldItem key={skill}>
              <FieldLabel>
                <Checkbox value={skill.toLowerCase().replace(".", "")} />
                {skill}
              </FieldLabel>
            </FieldItem>
          ))}
        </Fieldset>
      </Field>

      <Field name="notifications">
        <FieldLabel>
          Email notifications
          <Switch defaultChecked />
        </FieldLabel>
        <FieldDescription>
          Receive updates about team activity.
        </FieldDescription>
      </Field>

      <Field name="terms">
        <FieldLabel>
          <Checkbox required />I agree to the terms of service
        </FieldLabel>
        <FieldError match="valueMissing">
          You must agree to the terms
        </FieldError>
      </Field>

      <Button type="submit" variant="neutral">
        Create account
      </Button>
    </Form>
  );
}
