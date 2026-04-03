import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
} from "@/registry/default/select/select";

const timezoneGroups = [
  {
    value: "North America",
    items: [
      { label: "Eastern Standard Time (EST)", value: "est" },
      { label: "Central Standard Time (CST)", value: "cst" },
      { label: "Mountain Standard Time (MST)", value: "mst" },
      { label: "Pacific Standard Time (PST)", value: "pst" },
    ],
  },
  {
    value: "Europe & Africa",
    items: [
      { label: "Greenwich Mean Time (GMT)", value: "gmt" },
      { label: "Central European Time (CET)", value: "cet" },
      { label: "Eastern European Time (EET)", value: "eet" },
    ],
  },
  {
    value: "Asia",
    items: [
      { label: "Asia/Tokyo", value: "asia/tokyo" },
      { label: "Asia/Shanghai", value: "asia/shanghai" },
      { label: "Asia/Seoul", value: "asia/seoul" },
    ],
  },
];

export default function SelectWithGroups() {
  return (
    <Select items={timezoneGroups}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a timezone" />
      </SelectTrigger>
      <SelectContent fadeEdges={"bottom"} className="max-h-[300px]">
        {timezoneGroups.map((group, index) => (
          <React.Fragment key={group.value}>
            <SelectGroup>
              <SelectGroupLabel className="sticky top-0 z-1">
                {group.value}
              </SelectGroupLabel>
              {group.items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
            {index < timezoneGroups.length - 1 && <SelectSeparator />}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}
