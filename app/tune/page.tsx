import * as React from "react";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

// Lists every app/tune/<component>/ folder, so new tune pages show up here
// without registering them anywhere.
export default function TuneIndex(): React.ReactElement {
  const pages = fs
    .readdirSync(path.join(process.cwd(), "app/tune"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-lg font-semibold">Tune</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Live dials for components. See TUNING.md.
      </p>
      <ul className="mt-6 space-y-1">
        {pages.map((name) => (
          <li key={name}>
            <Link
              href={`/tune/${name}`}
              className="hover:text-foreground text-muted-foreground text-sm capitalize underline-offset-4 hover:underline"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
