"use client";

import {
  PreviewCard,
  PreviewCardTrigger,
  PreviewCardContent,
  createPreviewCardHandle,
} from "@/registry/default/preview-card/preview-card";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/registry/default/avatar/avatar";

type Person = {
  id: string;
  name: string;
  initials: string;
  role: string;
  commits: number;
  tint: string;
};

const PEOPLE: Person[] = [
  {
    id: "maren",
    name: "Maren Okafor",
    initials: "MO",
    role: "Typography",
    commits: 412,
    tint: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    id: "tomas",
    name: "Tomás Reyes",
    initials: "TR",
    role: "Motion and gestures",
    commits: 268,
    tint: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  },
  {
    id: "ines",
    name: "Inès Laurent",
    initials: "IL",
    role: "Accessibility review",
    commits: 1093,
    tint: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    id: "kenji",
    name: "Kenji Arai",
    initials: "KA",
    role: "Docs and examples",
    commits: 57,
    tint: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  },
];

const handle = createPreviewCardHandle<Person>();

export default function PreviewCardGroup() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex -space-x-2">
        {PEOPLE.map((person) => (
          <PreviewCardTrigger
            key={person.id}
            handle={handle}
            payload={person}
            href="#"
            aria-label={person.name}
            className="group focus-visible:outline-ring inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Avatar className="ring-background ring-2 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-data-popup-open:-translate-y-0.5 motion-reduce:transition-none">
              <AvatarFallback
                className={cn("text-sm font-medium", person.tint)}
              >
                {person.initials}
              </AvatarFallback>
            </Avatar>
          </PreviewCardTrigger>
        ))}
      </div>
      <PreviewCard handle={handle}>
        {({ payload }) => (
          <PreviewCardContent className="w-60">
            {payload && (
              <>
                <p className="text-foreground font-semibold">{payload.name}</p>
                <p className="text-muted-foreground">{payload.role}</p>
                <p className="text-muted-foreground mt-3 tabular-nums">
                  <span className="text-foreground font-medium">
                    {payload.commits.toLocaleString("en-US")}
                  </span>{" "}
                  commits this year
                </p>
              </>
            )}
          </PreviewCardContent>
        )}
      </PreviewCard>
    </div>
  );
}
