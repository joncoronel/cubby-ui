"use client";

/**
 * Conform-based Form Components
 *
 * Usage example:
 *
 * ```tsx
 * import { useForm } from "@conform-to/react"
 * import { parseWithZod } from "@conform-to/zod"
 * import { z } from "zod"
 * import { Input } from "@/registry/default/input/input"
 *
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(6)
 * })
 *
 * function MyForm() {
 *   const [form, fields] = useForm({
 *     onValidate({ formData }) {
 *       return parseWithZod(formData, { schema })
 *     }
 *   })
 *
 *   return (
 *     <Form form={form} fields={fields}>
 *       <FormField name="email">
 *         <FormItem>
 *           <FormLabel>Email</FormLabel>
 *           <FormControl>
 *             <Input
 *               type="email"
 *               name={fields.email.name}
 *               defaultValue={fields.email.initialValue}
 *               placeholder="Enter your email"
 *             />
 *           </FormControl>
 *           <FormDescription>Enter your email address</FormDescription>
 *           <FormMessage />
 *         </FormItem>
 *       </FormField>
 *       <FormField name="password">
 *         <FormItem>
 *           <FormLabel>Password</FormLabel>
 *           <FormControl>
 *             <Input
 *               type="password"
 *               name={fields.password.name}
 *               defaultValue={fields.password.initialValue}
 *               placeholder="Enter your password"
 *             />
 *           </FormControl>
 *           <FormDescription>Must be at least 6 characters</FormDescription>
 *           <FormMessage />
 *         </FormItem>
 *       </FormField>
 *       <button type="submit">Submit</button>
 *     </Form>
 *   )
 * }
 * ```
 */

import * as React from "react";
import { useForm, type FieldMetadata } from "@conform-to/react";
import { Label } from "@/registry/default/label/label";
import { cn } from "@/lib/utils";

// Form context for sharing form instance
type FormContextValue = {
  form: ReturnType<typeof useForm>[0];
  fields: Record<string, FieldMetadata>;
};

const FormContext = React.createContext<FormContextValue | null>(null);

// Form provider component
function Form({
  form,
  fields,
  children,
  ...props
}: React.ComponentProps<"form"> & {
  form: ReturnType<typeof useForm>[0];
  fields: Record<string, FieldMetadata>;
}) {
  return (
    <FormContext.Provider value={{ form, fields }}>
      <form id={form.id} onSubmit={form.onSubmit} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Hook to access form context
const useFormField = (name: string) => {
  const context = React.useContext(FormContext);
  const itemContext = React.useContext(FormItemContext);

  if (!context) {
    throw new Error("useFormField should be used within <Form>");
  }

  const { fields } = context;
  const field = fields[name];

  if (!field) {
    throw new Error(`Field "${name}" not found in form fields`);
  }

  const { id } = itemContext;

  return {
    id,
    name: field.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: field.errors?.[0],
    errors: field.errors,
    initialValue: field.initialValue,
    value: field.value,
    key: field.key,
  };
};

// Form field wrapper
function FormField({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return <FormFieldProvider name={name}>{children}</FormFieldProvider>;
}

// Form field context
type FormFieldContextValue = {
  name: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

function FormFieldProvider({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      {children}
    </FormFieldContext.Provider>
  );
}

// Form item context
type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("group grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const fieldContext = React.useContext(FormFieldContext);

  if (!fieldContext) {
    throw new Error("FormLabel should be used within <FormField>");
  }

  const { error, formItemId } = useFormField(fieldContext.name);

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<"div">) {
  const fieldContext = React.useContext(FormFieldContext);

  if (!fieldContext) {
    throw new Error("FormControl should be used within <FormField>");
  }

  const { error, formItemId, formDescriptionId, formMessageId } = useFormField(
    fieldContext.name,
  );

  return (
    <div
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const fieldContext = React.useContext(FormFieldContext);

  if (!fieldContext) {
    throw new Error("FormDescription should be used within <FormField>");
  }

  const { formDescriptionId } = useFormField(fieldContext.name);

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const fieldContext = React.useContext(FormFieldContext);

  if (!fieldContext) {
    throw new Error("FormMessage should be used within <FormField>");
  }

  const { error, formMessageId } = useFormField(fieldContext.name);
  const body = error ? String(error) : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
