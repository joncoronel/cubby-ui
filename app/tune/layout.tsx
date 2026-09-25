import * as React from "react";
import { notFound } from "next/navigation";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";

// Dev-only tuning pages. DialKit lives here and never in registry/default,
// so nothing it touches ships with an installed component.
export default function TuneLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      {children}
      <DialRoot position="top-right" />
    </>
  );
}
