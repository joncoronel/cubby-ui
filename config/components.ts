import { PuzzleIcon, StickyNote01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface ComponentItem {
  title: string;
  url: string;
  icon?: IconSvgElement;
}

export interface ComponentGroup {
  label: string;
  items: ComponentItem[];
}

const allComponents: ComponentItem[] = [
  { title: "Card", url: "/components/card", icon: PuzzleIcon },
  { title: "Accordion", url: "/components/accordion", icon: PuzzleIcon },
  { title: "Collapsible", url: "/components/collapsible", icon: PuzzleIcon },
  { title: "Separator", url: "/components/separator", icon: PuzzleIcon },
  { title: "Tabs", url: "/components/tabs", icon: PuzzleIcon },
  {
    title: "Aspect Ratio",
    url: "/components/aspect-ratio",
    icon: PuzzleIcon,
  },
  { title: "Resizable", url: "/components/resizable", icon: PuzzleIcon },
  {
    title: "Navigation Menu",
    url: "/components/navigation-menu",
    icon: PuzzleIcon,
  },
  { title: "Breadcrumbs", url: "/components/breadcrumbs", icon: PuzzleIcon },
  { title: "Pagination", url: "/components/pagination", icon: PuzzleIcon },
  { title: "Command", url: "/components/command", icon: PuzzleIcon },
  { title: "Input", url: "/components/input", icon: PuzzleIcon },
  { title: "Input Group", url: "/components/input-group", icon: PuzzleIcon },
  { title: "Textarea", url: "/components/textarea", icon: PuzzleIcon },
  { title: "Checkbox", url: "/components/checkbox", icon: PuzzleIcon },
  {
    title: "Checkbox Group",
    url: "/components/checkbox-group",
    icon: PuzzleIcon,
  },
  { title: "Switch", url: "/components/switch", icon: PuzzleIcon },
  { title: "Radio Group", url: "/components/radio-group", icon: PuzzleIcon },
  { title: "Select", url: "/components/select", icon: PuzzleIcon },
  { title: "Combobox", url: "/components/combobox", icon: PuzzleIcon },
  {
    title: "Autocomplete",
    url: "/components/autocomplete",
    icon: PuzzleIcon,
  },
  { title: "Date Picker", url: "/components/date-picker", icon: PuzzleIcon },
  {
    title: "Date Range Picker",
    url: "/components/date-range-picker",
    icon: PuzzleIcon,
  },
  { title: "Slider", url: "/components/slider", icon: PuzzleIcon },
  { title: "Toggle", url: "/components/toggle", icon: PuzzleIcon },
  {
    title: "Toggle Group",
    url: "/components/toggle-group",
    icon: PuzzleIcon,
  },
  { title: "Input OTP", url: "/components/input-otp", icon: PuzzleIcon },

  { title: "Label", url: "/components/label", icon: PuzzleIcon },
  { title: "Button", url: "/components/button", icon: PuzzleIcon },
  {
    title: "Button Group",
    url: "/components/button-group",
    icon: PuzzleIcon,
  },
  {
    title: "Fancy Button",
    url: "/components/fancy-button",
    icon: PuzzleIcon,
  },
  {
    title: "Dropdown Menu",
    url: "/components/dropdown-menu",
    icon: PuzzleIcon,
  },
  {
    title: "Context Menu",
    url: "/components/context-menu",
    icon: PuzzleIcon,
  },
  { title: "Menubar", url: "/components/menubar", icon: PuzzleIcon },
  { title: "Toolbar", url: "/components/toolbar", icon: PuzzleIcon },
  { title: "Alert", url: "/components/alert", icon: PuzzleIcon },
  { title: "Toast", url: "/components/toast", icon: PuzzleIcon },
  { title: "Progress", url: "/components/progress", icon: PuzzleIcon },
  { title: "Skeleton", url: "/components/skeleton", icon: PuzzleIcon },
  { title: "Meter", url: "/components/meter", icon: PuzzleIcon },
  { title: "Dialog", url: "/components/dialog", icon: PuzzleIcon },
  { title: "Sheet", url: "/components/sheet", icon: PuzzleIcon },
  { title: "Drawer", url: "/components/drawer", icon: PuzzleIcon },
  { title: "Popover", url: "/components/popover", icon: PuzzleIcon },
  { title: "Tooltip", url: "/components/tooltip", icon: PuzzleIcon },
  {
    title: "Alert Dialog",
    url: "/components/alert-dialog",
    icon: PuzzleIcon,
  },
  {
    title: "Preview Card",
    url: "/components/preview-card",
    icon: PuzzleIcon,
  },
  { title: "Timeline", url: "/components/timeline", icon: PuzzleIcon },
  { title: "Badge", url: "/components/badge", icon: PuzzleIcon },
  { title: "Avatar", url: "/components/avatar", icon: PuzzleIcon },
  { title: "Code Block", url: "/components/code-block", icon: PuzzleIcon },
  { title: "Kbd", url: "/components/kbd", icon: PuzzleIcon },
  { title: "Scroll Area", url: "/components/scroll-area", icon: PuzzleIcon },
  { title: "Tree", url: "/components/tree", icon: PuzzleIcon },
  { title: "Calendar", url: "/components/calendar", icon: PuzzleIcon },
  { title: "Cropper", url: "/components/cropper", icon: PuzzleIcon },
].sort((a, b) => a.title.localeCompare(b.title));

export const componentGroups: ComponentGroup[] = [
  {
    label: "Getting Started",
    items: [
      { title: "Home", url: "/", icon: StickyNote01Icon },
      { title: "All Components", url: "/components", icon: StickyNote01Icon },
    ],
  },
  {
    label: "Components",
    items: allComponents,
  },
];
