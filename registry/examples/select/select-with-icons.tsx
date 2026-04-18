import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/registry/default/select/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChatIcon,
  GithubIcon,
  Mail01Icon,
  TelephoneIcon,
} from "@hugeicons/core-free-icons";
export default function SelectWithIcons() {
  const contactMethods = [
    { 
      label: "Email", 
      value: "email", 
      icon: <HugeiconsIcon icon={Mail01Icon} className="size-4"  strokeWidth={2} />,
      description: "Send us an email"
    },
    { 
      label: "Phone", 
      value: "phone", 
      icon: <HugeiconsIcon icon={TelephoneIcon} className="size-4"  strokeWidth={2} />,
      description: "Call us directly"
    },
    { 
      label: "Chat", 
      value: "chat", 
      icon: <HugeiconsIcon icon={ChatIcon} className="size-4"  strokeWidth={2} />,
      description: "Live chat support"
    },
    { 
      label: "GitHub", 
      value: "github", 
      icon: <HugeiconsIcon icon={GithubIcon} className="size-4"  strokeWidth={2} />,
      description: "Create an issue"
    },
  ];

  return (
    <Select items={contactMethods} defaultValue="email">
      <SelectTrigger className="w-[200px]">
        <SelectValue>
          {(value) => {
            const selected = contactMethods.find(method => method.value === value);
            return selected ? (
              <div className="flex items-center gap-2">
                {selected.icon}
                <span>{selected.label}</span>
              </div>
            ) : (
              <span>Select a contact method</span>
            );
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {contactMethods.map((method) => (
          <SelectItem key={method.value} value={method.value}>
            <div className="flex items-center gap-2">
              {method.icon}
              <div className="flex flex-col">
                <span>{method.label}</span>
                <span className="text-xs text-muted-foreground">{method.description}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}