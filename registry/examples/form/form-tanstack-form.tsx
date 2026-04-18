"use client";

import {
  useForm,
  revalidateLogic,
  type DeepKeys,
  type ValidationError,
} from "@tanstack/react-form";
import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";

interface FormValues {
  username: string;
  email: string;
}

const defaultValues: FormValues = {
  username: "",
  email: "",
};

export default function FormTanstackForm() {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value: formValues }) => {
      alert(JSON.stringify(formValues, null, 2));
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onDynamic: ({ value: formValues }) => {
        const errors: Partial<Record<DeepKeys<FormValues>, ValidationError>> =
          {};

        if (!formValues.username) {
          errors.username = "Username is required.";
        } else if (formValues.username.length < 3) {
          errors.username = "At least 3 characters.";
        }

        if (!formValues.email) {
          errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
          errors.email = "Invalid email address.";
        }

        return Object.keys(errors).length === 0
          ? undefined
          : { form: errors, fields: errors };
      },
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      className="w-full max-w-sm space-y-4"
      noValidate
    >
      <form.Field name="username">
        {(field) => (
          <Field
            name={field.name}
            invalid={!field.state.meta.isValid}
            dirty={field.state.meta.isDirty}
            touched={field.state.meta.isTouched}
          >
            <FieldLabel>Username</FieldLabel>
            <FieldControl
              value={field.state.value}
              onValueChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Choose a username"
            />
            <FieldDescription>At least 3 characters</FieldDescription>
            <FieldError match={!field.state.meta.isValid}>
              {field.state.meta.errors.join(",")}
            </FieldError>
          </Field>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <Field
            name={field.name}
            invalid={!field.state.meta.isValid}
            dirty={field.state.meta.isDirty}
            touched={field.state.meta.isTouched}
          >
            <FieldLabel>Email</FieldLabel>
            <FieldControl
              type="email"
              value={field.state.value}
              onValueChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="you@example.com"
            />
            <FieldError match={!field.state.meta.isValid}>
              {field.state.meta.errors.join(",")}
            </FieldError>
          </Field>
        )}
      </form.Field>

      <Button type="submit" variant="neutral">
        Submit
      </Button>
    </form>
  );
}
