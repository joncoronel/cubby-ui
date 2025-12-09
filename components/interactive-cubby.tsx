"use client";

import * as m from "motion/react-m";
import { useMotionValue, useTransform, useSpring } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  Square,
  RectangleHorizontal,
  Type,
  Circle,
  ToggleLeft,
  ListChecks,
  ChevronDown,
  MessageSquare,
  Info,
  Menu,
  Layers,
  Bell,
  User,
  Minus,
  Radio,
  BarChart3,
  SlidersHorizontal,
  Table,
  Calendar,
  ChevronRight,
  Images,
  Terminal,
  PanelLeft,
  Navigation2,
  Loader,
} from "lucide-react";

interface Component {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const allComponents: Component[] = [
  { id: "button", name: "Button", icon: Square },
  { id: "card", name: "Card", icon: RectangleHorizontal },
  { id: "input", name: "Input", icon: Type },
  { id: "badge", name: "Badge", icon: Circle },
  { id: "switch", name: "Switch", icon: ToggleLeft },
  { id: "checkbox", name: "Checkbox", icon: ListChecks },
  { id: "select", name: "Select", icon: ChevronDown },
  { id: "dialog", name: "Dialog", icon: MessageSquare },
  { id: "tooltip", name: "Tooltip", icon: Info },
  { id: "popover", name: "Popover", icon: MessageSquare },
  { id: "tabs", name: "Tabs", icon: Layers },
  { id: "accordion", name: "Accordion", icon: Menu },
  { id: "alert", name: "Alert", icon: Bell },
  { id: "avatar", name: "Avatar", icon: User },
  { id: "separator", name: "Separator", icon: Minus },
  { id: "radio", name: "Radio", icon: Radio },
  { id: "progress", name: "Progress", icon: BarChart3 },
  { id: "slider", name: "Slider", icon: SlidersHorizontal },
  { id: "table", name: "Table", icon: Table },
  { id: "calendar", name: "Calendar", icon: Calendar },
  { id: "breadcrumb", name: "Breadcrumb", icon: ChevronRight },
  { id: "carousel", name: "Carousel", icon: Images },
  { id: "command", name: "Command", icon: Terminal },
  { id: "drawer", name: "Drawer", icon: PanelLeft },
  { id: "navigation", name: "Navigation", icon: Navigation2 },
  { id: "skeleton", name: "Skeleton", icon: Loader },
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

  const Icon = component.icon;

  return (
    <m.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
      }}
      className="border-border/60 bg-background flex cursor-default items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
    >
      <Icon className="size-4" />
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
