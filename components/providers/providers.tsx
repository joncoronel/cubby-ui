"use client";

import { ThemeProvider } from "next-themes";
import { LazyMotion } from "motion/react";

import {
  ToastProvider,
  AnchoredToastProvider,
} from "@/registry/default/toast/toast";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

// Lazy load motion features
const loadFeatures = () =>
  import("@/lib/motion-features").then((res) => res.default);

export function Providers({ children }: ProvidersProps) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ToastProvider position="bottom-right">
          <AnchoredToastProvider>{children}</AnchoredToastProvider>
        </ToastProvider>
      </ThemeProvider>
    </LazyMotion>
  );
}
