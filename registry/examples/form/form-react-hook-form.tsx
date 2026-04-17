"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
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
  role: string;
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
      role: "",
    },
  });

  function onSubmit(data: FormValues) {
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm space-y-4"
    >
      <Controller
        name="name"
        control={control}
        rules={{ required: "Name is required", minLength: { value: 2, message: "At least 2 characters" } }}
        render={({ field: rhfField, fieldState }) => (
          <Field
            name="name"
            invalid={fieldState.invalid}
            dirty={fieldState.isDirty}
            touched={fieldState.isTouched}
          >
            <FieldLabel>Name</FieldLabel>
            <FieldControl
              placeholder="Enter your name"
              value={rhfField.value}
              onChange={rhfField.onChange}
              onBlur={rhfField.onBlur}
              ref={rhfField.ref}
            />
            {fieldState.error && (
              <FieldError match={true}>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        name="email"
        control={control}
        rules={{
          required: "Email is required",
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
        }}
        render={({ field: rhfField, fieldState }) => (
          <Field
            name="email"
            invalid={fieldState.invalid}
            dirty={fieldState.isDirty}
            touched={fieldState.isTouched}
          >
            <FieldLabel>Email</FieldLabel>
            <FieldControl
              type="email"
              placeholder="you@example.com"
              value={rhfField.value}
              onChange={rhfField.onChange}
              onBlur={rhfField.onBlur}
              ref={rhfField.ref}
            />
            {fieldState.error && (
              <FieldError match={true}>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        name="role"
        control={control}
        rules={{ required: "Please select a role" }}
        render={({ field: rhfField, fieldState }) => (
          <Field
            name="role"
            invalid={fieldState.invalid}
            dirty={fieldState.isDirty}
            touched={fieldState.isTouched}
          >
            <Select
              items={roles}
              value={rhfField.value}
              onValueChange={rhfField.onChange}
            >
              <div className="flex flex-col gap-1">
                <SelectLabel>Role</SelectLabel>
                <SelectTrigger className="w-[200px]">
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
            {fieldState.error && (
              <FieldError match={true}>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </form>
  );
}
