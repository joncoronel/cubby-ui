"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxPopup,
  createComboboxItems,
} from "@/registry/default/combobox/combobox";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ComboboxItemIds() {
  const [assigneeId, setAssigneeId] = React.useState<string | null>("u_2");

  return (
    <Combobox items={items} value={assigneeId} onValueChange={setAssigneeId}>
      <div className="flex w-full max-w-3xs flex-col gap-1">
        <ComboboxLabel>Assignee</ComboboxLabel>
        <ComboboxInput placeholder="Search people" />
        <p className="text-muted-foreground text-sm">
          Stored value:{" "}
          <code className="font-mono">{assigneeId ?? "null"}</code>
        </p>
      </div>
      <ComboboxPopup>
        <ComboboxEmpty>No people found.</ComboboxEmpty>
        <ComboboxList>
          {(user: User) => (
            <ComboboxItem key={user.id} value={user.id}>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}

const users: User[] = [
  { id: "u_1", name: "Maya Chen", email: "maya@example.com" },
  { id: "u_2", name: "Theo Adeyemi", email: "theo@example.com" },
  { id: "u_3", name: "Ines Moreau", email: "ines@example.com" },
  { id: "u_4", name: "Sam Okafor", email: "sam@example.com" },
  { id: "u_5", name: "Lena Novak", email: "lena@example.com" },
];

// Static data: build the collection once at module scope.
const items = createComboboxItems(users, {
  getValue: (user) => user.id,
  getLabel: (user) => user.name,
});
