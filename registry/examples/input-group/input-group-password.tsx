"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";

export default function InputGroupPassword() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput
        type={showPassword ? "text" : "password"}
        placeholder="Enter password"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon_xs"
          variant="ghost"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
