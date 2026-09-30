import type { ReactNode } from "react";
import "./home.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="landing text-foreground relative min-h-dvh overflow-x-clip">
      {children}
    </div>
  );
}
