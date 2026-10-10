"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/default/input-group/input-group";

function SearchField({ size }: { size: "sm" | "default" }) {
  const [query, setQuery] = React.useState("Invoices");
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <InputGroup size={size}>
      <InputGroupInput
        ref={inputRef}
        placeholder="Search..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      </InputGroupAddon>
      {query && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon"
            aria-label="Clear"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export default function InputGroupSize() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <SearchField size="sm" />
      <SearchField size="default" />
    </div>
  );
}
