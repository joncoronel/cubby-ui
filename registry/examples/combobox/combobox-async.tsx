"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  Combobox,
  ComboboxClear,
  ComboboxInput,
  ComboboxInputWrapper,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxPopup,
  ComboboxEmpty,
  ComboboxLabel,
  ComboboxStatus,
} from "@/registry/default/combobox/combobox";
import { useAsyncCombobox } from "@/registry/default/combobox/hooks/use-async-combobox";

export default function ComboboxAsync() {
  const [value, setValue] = React.useState<Employee | null>(null);

  const { items, comboboxProps, isPending, error, query } = useAsyncCombobox({
    searchFn: searchEmployees,
    value,
    onValueChange: setValue,
  });

  function getStatus() {
    if (isPending) {
      return (
        <>
          <Loader2 className="size-3 animate-spin" />
          Searching...
        </>
      );
    }
    if (error) return error;
    if (query === "") {
      return value ? null : "Start typing to search employees...";
    }
    if (items.length === 0) {
      return `No matches for "${query}".`;
    }
    return null;
  }

  function getEmptyMessage() {
    if (query === "" || isPending || items.length > 0 || error) {
      return null;
    }
    return "Try a different search term.";
  }

  return (
    <Combobox
      items={items}
      value={value}
      onValueChange={setValue}
      itemToStringLabel={(employee) => employee?.name ?? ""}
      {...comboboxProps}
    >
      <div className="flex w-full max-w-xs flex-col gap-1">
        <ComboboxLabel>Search employees</ComboboxLabel>
        <ComboboxInputWrapper>
          <ComboboxInput placeholder="e.g. Sarah" />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <ComboboxClear />
            <ComboboxTrigger />
          </div>
        </ComboboxInputWrapper>
      </div>
      <ComboboxPopup>
        <ComboboxStatus className="flex items-center gap-2">
          {getStatus()}
        </ComboboxStatus>
        <ComboboxEmpty>{getEmptyMessage()}</ComboboxEmpty>
        <ComboboxList>
          {(employee: Employee) => (
            <ComboboxItem key={employee.id} value={employee}>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{employee.name}</span>
                <span className="text-muted-foreground text-xs">
                  {employee.department} &middot; {employee.email}
                </span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
}

async function searchEmployees(
  query: string,
  signal: AbortSignal,
): Promise<Employee[]> {
  // Simulate network delay
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, Math.random() * 300 + 200);
    signal.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  // Small chance of error for demo
  if (Math.random() < 0.02 || query === "error") {
    throw new Error("Failed to search. Please try again.");
  }

  const lowerQuery = query.toLowerCase();
  return employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(lowerQuery) ||
      employee.department.toLowerCase().includes(lowerQuery) ||
      employee.email.toLowerCase().includes(lowerQuery),
  );
}

const employees: Employee[] = [
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    department: "Engineering",
    email: "sarah.chen@company.com",
  },
  {
    id: "marcus-johnson",
    name: "Marcus Johnson",
    department: "Design",
    email: "marcus.johnson@company.com",
  },
  {
    id: "elena-rodriguez",
    name: "Elena Rodriguez",
    department: "Marketing",
    email: "elena.rodriguez@company.com",
  },
  {
    id: "david-kim",
    name: "David Kim",
    department: "Engineering",
    email: "david.kim@company.com",
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    department: "Product",
    email: "priya.patel@company.com",
  },
  {
    id: "james-wilson",
    name: "James Wilson",
    department: "Sales",
    email: "james.wilson@company.com",
  },
  {
    id: "aisha-mohamed",
    name: "Aisha Mohamed",
    department: "Engineering",
    email: "aisha.mohamed@company.com",
  },
  {
    id: "michael-brown",
    name: "Michael Brown",
    department: "Finance",
    email: "michael.brown@company.com",
  },
  {
    id: "lisa-wang",
    name: "Lisa Wang",
    department: "Design",
    email: "lisa.wang@company.com",
  },
  {
    id: "carlos-garcia",
    name: "Carlos Garcia",
    department: "Support",
    email: "carlos.garcia@company.com",
  },
  {
    id: "emma-taylor",
    name: "Emma Taylor",
    department: "HR",
    email: "emma.taylor@company.com",
  },
  {
    id: "raj-sharma",
    name: "Raj Sharma",
    department: "Engineering",
    email: "raj.sharma@company.com",
  },
  {
    id: "olivia-martin",
    name: "Olivia Martin",
    department: "Legal",
    email: "olivia.martin@company.com",
  },
  {
    id: "tom-anderson",
    name: "Tom Anderson",
    department: "Product",
    email: "tom.anderson@company.com",
  },
  {
    id: "nina-petrov",
    name: "Nina Petrov",
    department: "Marketing",
    email: "nina.petrov@company.com",
  },
  {
    id: "alex-thompson",
    name: "Alex Thompson",
    department: "Engineering",
    email: "alex.thompson@company.com",
  },
  {
    id: "maya-lee",
    name: "Maya Lee",
    department: "Design",
    email: "maya.lee@company.com",
  },
  {
    id: "ben-clark",
    name: "Ben Clark",
    department: "Sales",
    email: "ben.clark@company.com",
  },
  {
    id: "zoe-adams",
    name: "Zoe Adams",
    department: "Finance",
    email: "zoe.adams@company.com",
  },
  {
    id: "kevin-nguyen",
    name: "Kevin Nguyen",
    department: "Support",
    email: "kevin.nguyen@company.com",
  },
];
