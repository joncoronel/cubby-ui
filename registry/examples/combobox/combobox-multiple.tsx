"use client";

import { X } from "lucide-react";
import {
  Combobox,
  ComboboxChipInput,
  ComboboxItem,
  ComboboxList,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxValue,
  ComboboxPopup,
  ComboboxEmpty,
  ComboboxLabel,
} from "@/registry/default/combobox/combobox";

export default function ComboboxMultiple() {
  return (
    <Combobox items={langs} multiple>
      <div className="flex w-full max-w-xs flex-col gap-1">
        <ComboboxLabel>Programming languages</ComboboxLabel>
        <ComboboxChips>
          <ComboboxValue>
            {(value: ProgrammingLanguage[]) => (
              <>
                {value.map((language) => (
                  <ComboboxChip key={language.id} aria-label={language.value}>
                    {language.value}
                    <ComboboxChipRemove aria-label="Remove">
                      <X className="h-3 w-3" />
                    </ComboboxChipRemove>
                  </ComboboxChip>
                ))}
                <ComboboxChipInput
                  placeholder={value.length > 0 ? "" : "e.g. TypeScript"}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
      </div>

      <ComboboxPopup>
        <ComboboxEmpty>No languages found.</ComboboxEmpty>
        <ComboboxList>
          {(language: ProgrammingLanguage) => (
            <ComboboxItem key={language.id} value={language}>
              {language.value}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}

interface ProgrammingLanguage {
  id: string;
  value: string;
}

const langs: ProgrammingLanguage[] = [
  { id: "js", value: "JavaScript" },
  { id: "ts", value: "TypeScript" },
  { id: "py", value: "Python" },
  { id: "java", value: "Java" },
  { id: "cpp", value: "C++" },
  { id: "cs", value: "C#" },
  { id: "php", value: "PHP" },
  { id: "ruby", value: "Ruby" },
  { id: "go", value: "Go" },
  { id: "rust", value: "Rust" },
  { id: "swift", value: "Swift" },
];
