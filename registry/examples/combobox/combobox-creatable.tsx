"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";
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
import { useCreatableCombobox } from "@/registry/default/combobox/hooks/use-creatable-combobox";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/registry/default/dialog/dialog";

export default function ComboboxCreatable() {
  const [items, setItems] = React.useState<LabelItem[]>(initialLabels);
  const [selectedItems, setSelectedItems] = React.useState<LabelItem[]>([]);

  const {
    itemsWithCreatable,
    comboboxProps,
    dialogProps,
    dialogInputProps,
    onDialogSubmit,
    handleCancel,
  } = useCreatableCombobox({
    items,
    onItemsChange: setItems,
    selectedItems,
    onSelectedItemsChange: setSelectedItems,
  });

  return (
    <>
      <Combobox items={itemsWithCreatable} multiple {...comboboxProps}>
        <div className="flex w-full max-w-xs flex-col gap-1">
          <ComboboxLabel>Labels</ComboboxLabel>
          <ComboboxChips>
            <ComboboxValue>
              {(value: LabelItem[]) => (
                <>
                  {value.map((label) => (
                    <ComboboxChip key={label.id} aria-label={label.value}>
                      {label.value}
                      <ComboboxChipRemove aria-label="Remove">
                        <X className="h-3 w-3" />
                      </ComboboxChipRemove>
                    </ComboboxChip>
                  ))}
                  <ComboboxChipInput
                    placeholder={value.length > 0 ? "" : "e.g. bug"}
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
        </div>

        <ComboboxPopup>
          <ComboboxEmpty>No labels found.</ComboboxEmpty>
          <ComboboxList>
            {(item: LabelItem) =>
              item.creatable ? (
                <ComboboxItem
                  key={item.id}
                  value={item}
                  className="grid-cols-auto"
                >
                  <div className="grid grid-cols-[1rem_1fr] items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="break-all">Create "{item.creatable}"</span>
                  </div>
                </ComboboxItem>
              ) : (
                <ComboboxItem key={item.id} value={item}>
                  {item.value}
                </ComboboxItem>
              )
            }
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>

      <Dialog {...dialogProps}>
        <DialogContent showCloseButton={false}>
          <form onSubmit={onDialogSubmit}>
            <DialogHeader>
              <DialogTitle>Create new label</DialogTitle>
              <DialogDescription>Add a new label to select.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Input
                key={dialogInputProps.defaultValue}
                {...dialogInputProps}
                placeholder="Label name"
                autoFocus
              />
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface LabelItem {
  creatable?: string;
  id: string;
  value: string;
}

const initialLabels: LabelItem[] = [
  { id: "bug", value: "bug" },
  { id: "docs", value: "documentation" },
  { id: "enhancement", value: "enhancement" },
  { id: "help-wanted", value: "help wanted" },
  { id: "good-first-issue", value: "good first issue" },
];
