import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/registry/default/select/select";

export default function SelectWithScroll() {
  const countries = [
    { label: "Select a country", value: null },
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
    { label: "United Kingdom", value: "uk" },
    { label: "Germany", value: "de" },
    { label: "France", value: "fr" },
    { label: "Italy", value: "it" },
    { label: "Spain", value: "es" },
    { label: "Netherlands", value: "nl" },
    { label: "Belgium", value: "be" },
    { label: "Switzerland", value: "ch" },
    { label: "Austria", value: "at" },
    { label: "Portugal", value: "pt" },
    { label: "Sweden", value: "se" },
    { label: "Norway", value: "no" },
    { label: "Denmark", value: "dk" },
    { label: "Finland", value: "fi" },
    { label: "Poland", value: "pl" },
    { label: "Czech Republic", value: "cz" },
    { label: "Hungary", value: "hu" },
    { label: "Romania", value: "ro" },
    { label: "Bulgaria", value: "bg" },
    { label: "Croatia", value: "hr" },
    { label: "Slovenia", value: "si" },
    { label: "Slovakia", value: "sk" },
    { label: "Estonia", value: "ee" },
    { label: "Latvia", value: "lv" },
    { label: "Lithuania", value: "lt" },
    { label: "Greece", value: "gr" },
    { label: "Cyprus", value: "cy" },
    { label: "Malta", value: "mt" },
  ];

  return (
    <Select items={countries} defaultValue={null}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {countries.map((country) => (
          <SelectItem key={country.value} value={country.value}>
            {country.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
