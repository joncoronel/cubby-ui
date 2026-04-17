"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";

export default function FormTanstackForm() {
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
    },
    onSubmit: ({ value }) => {
      alert(JSON.stringify(value, null, 2));
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="w-full max-w-sm space-y-4"
    >
      <form.Field
        name="username"
        validators={{
          onChange: ({ value }) => {
            if (value.length < 3) return "Must be at least 3 characters";
            if (!/^[a-zA-Z0-9_]+$/.test(value))
              return "Only letters, numbers, and underscores";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field
            name="username"
            invalid={field.state.meta.errors.length > 0}
            touched={field.state.meta.isTouched}
            dirty={field.state.meta.isDirty}
          >
            <FieldLabel>Username</FieldLabel>
            <FieldControl
              placeholder="Choose a username"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <FieldDescription>Letters, numbers, and underscores only</FieldDescription>
            {field.state.meta.errors.length > 0 && (
              <FieldError match={true}>
                {field.state.meta.errors[0]?.toString()}
              </FieldError>
            )}
          </Field>
        )}
      </form.Field>
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "Email is required";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
              return "Invalid email address";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field
            name="email"
            invalid={field.state.meta.errors.length > 0}
            touched={field.state.meta.isTouched}
            dirty={field.state.meta.isDirty}
          >
            <FieldLabel>Email</FieldLabel>
            <FieldControl
              type="email"
              placeholder="you@example.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <FieldError match={true}>
                {field.state.meta.errors[0]?.toString()}
              </FieldError>
            )}
          </Field>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" variant="neutral" disabled={!canSubmit}>
            Submit
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
