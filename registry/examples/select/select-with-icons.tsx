import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/registry/default/select/select";
import { Github, Mail, Phone, MessageCircle } from "lucide-react";

export default function SelectWithIcons() {
  const contactMethods = [
    { 
      label: "Email", 
      value: "email", 
      icon: <Mail className="size-4" />,
      description: "Send us an email"
    },
    { 
      label: "Phone", 
      value: "phone", 
      icon: <Phone className="size-4" />,
      description: "Call us directly"
    },
    { 
      label: "Chat", 
      value: "chat", 
      icon: <MessageCircle className="size-4" />,
      description: "Live chat support"
    },
    { 
      label: "GitHub", 
      value: "github", 
      icon: <Github className="size-4" />,
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