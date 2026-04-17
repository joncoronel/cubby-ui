"use client";

import { Button } from "@/registry/default/button/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/default/field/field";
import { Form } from "@/registry/default/form/form";
import {
  OTPField,
  OTPFieldInput,
} from "@/registry/default/otp-field/otp-field";

const OTP_LENGTH = 6;

export default function OtpFieldField() {
  return (
    <Form
      className="space-y-4"
      onFormSubmit={(values) => {
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Field name="verificationCode">
        <FieldLabel>Verification code</FieldLabel>
        <FieldDescription>
          Enter the 6-character code we sent to your device.
        </FieldDescription>
        <OTPField length={OTP_LENGTH}>
          {Array.from({ length: OTP_LENGTH }, (_, index) => (
            <OTPFieldInput
              key={index}
              aria-label={`Character ${index + 1} of ${OTP_LENGTH}`}
            />
          ))}
        </OTPField>
        <FieldError />
      </Field>
      <Button type="submit" variant="neutral">
        Verify
      </Button>
    </Form>
  );
}
