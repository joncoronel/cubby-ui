import * as React from "react";

export function highlightText(text: string, query: string): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }

  const limited = trimmed.slice(0, 100);
  const escaped = limited.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return text.split(regex).map((part, idx) =>
    regex.test(part) ? (
      <mark key={idx} className="text-primary bg-transparent font-bold">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}