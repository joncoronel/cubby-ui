import type { ReactNode } from "react";
import { TopNav } from "@/components/home/top-nav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
