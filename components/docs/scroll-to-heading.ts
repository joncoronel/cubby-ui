import type * as React from "react";

/** Smooth-scrolls to a heading link's target and records it in history. */
export function scrollToHeading(event: React.MouseEvent<HTMLAnchorElement>) {
  const url = event.currentTarget.getAttribute("href");
  const target = url ? document.getElementById(url.slice(1)) : null;
  if (!url || !target) return;
  event.preventDefault();
  history.pushState(null, "", url);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}
