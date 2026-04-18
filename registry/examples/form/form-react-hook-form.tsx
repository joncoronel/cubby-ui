"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";

interface FormValues {
  name: string;
  email: string;
  role: string | null;
}

const roles = [
  { label: "Developer", value: "developer" },
  { label: "Designer", value: "designer" },
  { label: "Manager", value: "manager" },
];

export default function FormReactHookForm() {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      role: null,
    },
  });

  function submitForm(data: FormValues) {
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <Form
      className="w-full max-w-sm space-y-4"
      onSubmit={handleSubmit(submitForm)}
    >
      <Controller
        name="name"
        control={control}
        rules={{
          required: "This field is required.",
          minLength: { value: 2, message: "At least 2 characters." },
        }}
        render={({
          field: { ref, name, value, onBlur, onChange },
          fieldState: { invalid, isTouched, isDirty, error },
        }) => (
          <Field
            name={name}
            invalid={invalid}
            touched={isTouched}
            dirty={isDirty}
          >
            <FieldLabel>Name</FieldLabel>
            <FieldControl
              ref={ref}
              value={value}
              onBlur={onBlur}
              onValueChange={onChange}
              placeholder="Enter your name"
            />
            <FieldError match={!!error}>{error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name="email"
        control={control}
        rules={{
          required: "This field is required.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email address.",
          },
        }}
        render={({
          field: { ref, name, value, onBlur, onChange },
          fieldState: { invalid, isTouched, isDirty, error },
        }) => (
          <Field
            name={name}
            invalid={invalid}
            touched={isTouched}
            dirty={isDirty}
          >
            <FieldLabel>Email</FieldLabel>
            <FieldControl
              ref={ref}
              type="email"
              value={value}
              onBlur={onBlur}
              onValueChange={onChange}
              placeholder="you@example.com"
            />
            <FieldError match={!!error}>{error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name="role"
        control={control}
        rules={{ required: "Please select a role." }}
        render={({
          field: { ref, name, value, onBlur, onChange },
          fieldState: { invalid, isTouched, isDirty, error },
        }) => (
          <Field
            name={name}
            invalid={invalid}
            touched={isTouched}
            dirty={isDirty}
          >
            <Select
              items={roles}
              value={value}
              onValueChange={onChange}
              inputRef={ref}
            >
              <div className="flex flex-col gap-1">
                <SelectLabel>Role</SelectLabel>
                <SelectTrigger className="w-[200px]" onBlur={onBlur}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </div>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError match={!!error}>{error?.message}</FieldError>
          </Field>
        )}
      />

      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </Form>
  );
}
