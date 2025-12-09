"use client";

import Link from "next/link";
import { Button } from "@/registry/default/button/button";

export default function ButtonWithLink() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button nativeButton={false} render={<Link href="/docs" />}>
        Documentation
      </Button>

      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/components" />}
      >
        Components
      </Button>

      <Button
        variant="ghost"
        nativeButton={false}
        render={
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          />
        }
      >
        External Link
      </Button>
    </div>
  );
}
