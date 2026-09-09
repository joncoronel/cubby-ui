"use client";

import * as m from "motion/react-m";
import { useMotionValue, useTransform, useSpring } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  BarChartIcon,
  BubbleChatIcon,
  Calendar01Icon,
  CheckListIcon,
  CircleIcon,
  ComputerTerminal01Icon,
  Image02Icon,
  InformationCircleIcon,
  Layers01Icon,
  Loading03Icon,
  Menu01Icon,
  MinusSignIcon,
  Navigation03Icon,
  Notification03Icon,
  Radio01Icon,
  RectangularIcon,
  SidebarLeft01Icon,
  SlidersHorizontalIcon,
  Square01Icon,
  Table01Icon,
  TextFontIcon,
  ToggleOffIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
interface Component {
  id: string;
  name: string;
  icon: IconSvgElement;
}

const allComponents: Component[] = [
  { id: "button", name: "Button", icon: Square01Icon },
  { id: "card", name: "Card", icon: RectangularIcon },
  { id: "input", name: "Input", icon: TextFontIcon },
  { id: "badge", name: "Badge", icon: CircleIcon },
  { id: "switch", name: "Switch", icon: ToggleOffIcon },
  { id: "checkbox", name: "Checkbox", icon: CheckListIcon },
  { id: "select", name: "Select", icon: ArrowDown01Icon },
  { id: "dialog", name: "Dialog", icon: BubbleChatIcon },
  { id: "tooltip", name: "Tooltip", icon: InformationCircleIcon },
  { id: "popover", name: "Popover", icon: BubbleChatIcon },
  { id: "tabs", name: "Tabs", icon: Layers01Icon },
  { id: "accordion", name: "Accordion", icon: Menu01Icon },
  { id: "alert", name: "Alert", icon: Notification03Icon },
  { id: "avatar", name: "Avatar", icon: UserIcon },
  { id: "separator", name: "Separator", icon: MinusSignIcon },
  { id: "radio", name: "Radio", icon: Radio01Icon },
  { id: "progress", name: "Progress", icon: BarChartIcon },
  { id: "slider", name: "Slider", icon: SlidersHorizontalIcon },
  { id: "table", name: "Table", icon: Table01Icon },
  { id: "calendar", name: "Calendar", icon: Calendar01Icon },
  { id: "breadcrumb", name: "Breadcrumb", icon: ArrowRight01Icon },
  { id: "carousel", name: "Carousel", icon: Image02Icon },
  { id: "command", name: "Command", icon: ComputerTerminal01Icon },
  { id: "drawer", name: "Drawer", icon: SidebarLeft01Icon },
  { id: "navigation", name: "Navigation", icon: Navigation03Icon },
  { id: "skeleton", name: "Skeleton", icon: Loading03Icon },
];

interface MagneticChipProps {
  component: Component;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
}

function MagneticChip({ component, mouseX, mouseY }: MagneticChipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [chipPos, setChipPos] = useState({ x: 0, y: 0 });

  // Update chip position when component mounts or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setChipPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  // Calculate offset based on mouse distance
  const offsetX = useTransform(() => {
    const mx = mouseX.get();
    const my = mouseY.get();
    const dx = mx - chipPos.x;
    const dy = my - chipPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Magnetic range: 200px
    if (distance > 200 || distance === 0) return 0;

    // Calculate pull strength (max 45px)
    const pullStrength = (1 - distance / 200) * 45;
    return (dx / distance) * pullStrength;
  });

  const offsetY = useTransform(() => {
    const mx = mouseX.get();
    const my = mouseY.get();
    const dx = mx - chipPos.x;
    const dy = my - chipPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 200 || distance === 0) return 0;

    const pullStrength = (1 - distance / 200) * 45;
    return (dy / distance) * pullStrength;
  });

  // Smooth the movement with springs
  const springX = useSpring(offsetX, { stiffness: 150, damping: 15 });
  const springY = useSpring(offsetY, { stiffness: 150, damping: 15 });

  return (
    <m.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
      }}
      className="border-border/60 bg-background flex cursor-default items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
    >
      <HugeiconsIcon icon={component.icon} strokeWidth={2} className="size-4" />
      <span>{component.name}</span>
    </m.div>
  );
}

export function InteractiveCubby() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseLeave = () => {
    // Set mouse position far away to ensure all chips return to center
    mouseX.set(9999);
    mouseY.set(9999);
  };

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Magnetic grid with gradient fade at top and bottom */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      >
        <div className="grid grid-cols-2 gap-3 px-12">
          {allComponents.map((component) => (
            <MagneticChip
              key={component.id}
              component={component}
              mouseX={mouseX}
              mouseY={mouseY}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
