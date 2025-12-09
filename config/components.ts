import type { LucideIcon } from "lucide-react";
import { ComponentIcon, StickyNoteIcon } from "lucide-react";

export interface ComponentItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export interface ComponentGroup {
  label: string;
  items: ComponentItem[];
}

const allComponents: ComponentItem[] = [
  { title: "Card", url: "/components/card", icon: ComponentIcon },
  { title: "Accordion", url: "/components/accordion", icon: ComponentIcon },
  { title: "Collapsible", url: "/components/collapsible", icon: ComponentIcon },
  { title: "Separator", url: "/components/separator", icon: ComponentIcon },
  { title: "Tabs", url: "/components/tabs", icon: ComponentIcon },
  {
    title: "Aspect Ratio",
    url: "/components/aspect-ratio",
    icon: ComponentIcon,
  },
  { title: "Resizable", url: "/components/resizable", icon: ComponentIcon },
  {
    title: "Navigation Menu",
    url: "/components/navigation-menu",
    icon: ComponentIcon,
  },
  { title: "Breadcrumbs", url: "/components/breadcrumbs", icon: ComponentIcon },
  { title: "Pagination", url: "/components/pagination", icon: ComponentIcon },
  { title: "Command", url: "/components/command", icon: ComponentIcon },
  { title: "Input", url: "/components/input", icon: ComponentIcon },
  { title: "Input Group", url: "/components/input-group", icon: ComponentIcon },
  { title: "Textarea", url: "/components/textarea", icon: ComponentIcon },
  { title: "Checkbox", url: "/components/checkbox", icon: ComponentIcon },
  {
    title: "Checkbox Group",
    url: "/components/checkbox-group",
    icon: ComponentIcon,
  },
  { title: "Switch", url: "/components/switch", icon: ComponentIcon },
  { title: "Radio Group", url: "/components/radio-group", icon: ComponentIcon },
  { title: "Select", url: "/components/select", icon: ComponentIcon },
  { title: "Combobox", url: "/components/combobox", icon: ComponentIcon },
  {
    title: "Autocomplete",
    url: "/components/autocomplete",
    icon: ComponentIcon,
  },
  { title: "Date Picker", url: "/components/date-picker", icon: ComponentIcon },
  {
    title: "Date Range Picker",
    url: "/components/date-range-picker",
    icon: ComponentIcon,
  },
  { title: "Slider", url: "/components/slider", icon: ComponentIcon },
  { title: "Toggle", url: "/components/toggle", icon: ComponentIcon },
  {
    title: "Toggle Group",
    url: "/components/toggle-group",
    icon: ComponentIcon,
  },
  { title: "Input OTP", url: "/components/input-otp", icon: ComponentIcon },

  { title: "Label", url: "/components/label", icon: ComponentIcon },
  { title: "Button", url: "/components/button", icon: ComponentIcon },
  {
    title: "Button Group",
    url: "/components/button-group",
    icon: ComponentIcon,
  },
  {
    title: "Fancy Button",
    url: "/components/fancy-button",
    icon: ComponentIcon,
  },
  {
    title: "Dropdown Menu",
    url: "/components/dropdown-menu",
    icon: ComponentIcon,
  },
  {
    title: "Context Menu",
    url: "/components/context-menu",
    icon: ComponentIcon,
  },
  { title: "Menubar", url: "/components/menubar", icon: ComponentIcon },
  { title: "Toolbar", url: "/components/toolbar", icon: ComponentIcon },
  { title: "Alert", url: "/components/alert", icon: ComponentIcon },
  { title: "Toast", url: "/components/toast", icon: ComponentIcon },
  { title: "Progress", url: "/components/progress", icon: ComponentIcon },
  { title: "Skeleton", url: "/components/skeleton", icon: ComponentIcon },
  { title: "Meter", url: "/components/meter", icon: ComponentIcon },
  { title: "Dialog", url: "/components/dialog", icon: ComponentIcon },
  { title: "Sheet", url: "/components/sheet", icon: ComponentIcon },
  { title: "Drawer", url: "/components/drawer", icon: ComponentIcon },
  { title: "Popover", url: "/components/popover", icon: ComponentIcon },
  { title: "Tooltip", url: "/components/tooltip", icon: ComponentIcon },
  {
    title: "Alert Dialog",
    url: "/components/alert-dialog",
    icon: ComponentIcon,
  },
  {
    title: "Preview Card",
    url: "/components/preview-card",
    icon: ComponentIcon,
  },
  { title: "Timeline", url: "/components/timeline", icon: ComponentIcon },
  { title: "Badge", url: "/components/badge", icon: ComponentIcon },
  { title: "Avatar", url: "/components/avatar", icon: ComponentIcon },
  { title: "Code Block", url: "/components/code-block", icon: ComponentIcon },
  { title: "Kbd", url: "/components/kbd", icon: ComponentIcon },
  { title: "Scroll Area", url: "/components/scroll-area", icon: ComponentIcon },
  { title: "Tree", url: "/components/tree", icon: ComponentIcon },
  { title: "Calendar", url: "/components/calendar", icon: ComponentIcon },
  { title: "Cropper", url: "/components/cropper", icon: ComponentIcon },
].sort((a, b) => a.title.localeCompare(b.title));

export const componentGroups: ComponentGroup[] = [
  {
    label: "Getting Started",
    items: [
      { title: "Home", url: "/", icon: StickyNoteIcon },
      { title: "All Components", url: "/components", icon: StickyNoteIcon },
    ],
  },
  {
    label: "Components",
    items: allComponents,
  },
];
