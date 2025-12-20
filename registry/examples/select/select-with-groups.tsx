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

export default function SelectWithGroups() {
  const timezoneItems = [
    { label: "Select a timezone", value: null },
    {
      label: "Eastern Standard Time (EST)",
      value: "est",
      group: "North America",
    },
    {
      label: "Central Standard Time (CST)",
      value: "cst",
      group: "North America",
    },
    {
      label: "Mountain Standard Time (MST)",
      value: "mst",
      group: "North America",
    },
    {
      label: "Pacific Standard Time (PST)",
      value: "pst",
      group: "North America",
    },
    {
      label: "Greenwich Mean Time (GMT)",
      value: "gmt",
      group: "Europe & Africa",
    },
    {
      label: "Central European Time (CET)",
      value: "cet",
      group: "Europe & Africa",
    },
    {
      label: "Eastern European Time (EET)",
      value: "eet",
      group: "Europe & Africa",
    },
    {
      label: "Asia/Tokyo",
      value: "asia/tokyo",
      group: "Asia",
    },
    {
      label: "Asia/Shanghai",
      value: "asia/shanghai",
      group: "Asia",
    },
    {
      label: "Asia/Seoul",
      value: "asia/seoul",
      group: "Asia",
    },
  ];

  return (
    <Select items={timezoneItems}>
      <SelectTrigger className="w-[280px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent fadeEdges={"bottom"} className="max-h-[300px]">
        <SelectGroup>
          <SelectGroupLabel className="sticky top-0 z-[1]">
            North America
          </SelectGroupLabel>
          {timezoneItems
            .filter((item) => item.group === "North America")
            .map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
        </SelectGroup>
        <SelectSeparator className="" />
        <SelectGroup>
          <SelectGroupLabel className="sticky top-0 z-[1]">
            Europe & Africa
          </SelectGroupLabel>
          {timezoneItems
            .filter((item) => item.group === "Europe & Africa")
            .map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
        </SelectGroup>
        <SelectSeparator className="" />
        <SelectGroup>
          <SelectGroupLabel className="sticky top-0 z-[1]">
            Asia
          </SelectGroupLabel>
          {timezoneItems
            .filter((item) => item.group === "Asia")
            .map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
