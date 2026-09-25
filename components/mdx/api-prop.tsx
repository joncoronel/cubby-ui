"use client";

import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface ApiPropProps {
  name: string;
  fullType: string;
  simpleType?: string;
  defaultValue?: string;
  required?: boolean;
  children: ReactNode;
}

const SPAN_ALL = "col-span-2 sm:col-span-3 md:col-span-4";

export function ApiProp({
  name,
  fullType,
  simpleType,
  defaultValue,
  required = false,
  children,
}: ApiPropProps) {
  return (
    <Collapsible.Root
      data-slot="api-prop"
      className={`group/prop border-border/70 grid grid-cols-subgrid border-b ${SPAN_ALL}`}
    >
      <Collapsible.Trigger
        className={`docs-prop-trigger group/trigger focus-visible:outline-ring/50 grid cursor-pointer grid-cols-subgrid items-center rounded-md text-left outline-none focus-visible:outline-2 ${SPAN_ALL}`}
      >
        <span className="flex min-w-0 items-center gap-2 py-3 pr-4">
          <code className="text-foreground font-mono text-[0.8125rem] font-medium">
            {name}
          </code>
          {required && (
            <span className="text-danger-foreground text-xs font-medium">
              required
            </span>
          )}
        </span>

        <code className="text-muted-foreground hidden min-w-0 truncate py-3 pr-4 font-mono text-[0.8125rem] sm:block">
          {simpleType || fullType}
        </code>

        <code className="text-muted-foreground hidden py-3 pr-4 font-mono text-[0.8125rem] md:block">
          {defaultValue !== undefined ? defaultValue : "–"}
        </code>

        <span className="flex items-center justify-end py-3 sm:col-start-3 md:col-start-4">
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="text-muted-foreground ease-out-expo size-3.5 shrink-0 transition-transform duration-300 group-data-[panel-open]/trigger:rotate-90"
            strokeWidth={2}
          />
        </span>
      </Collapsible.Trigger>

      <Collapsible.Panel
        className={`docs-prop-panel ease-out-expo h-(--collapsible-panel-height) overflow-hidden transition-[height,opacity] duration-300 data-[ending-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:h-0 data-[starting-style]:opacity-0 ${SPAN_ALL}`}
      >
        <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 pt-0.5 pb-4 text-sm">
          <dt className="sr-only">Description</dt>
          <dd className="text-foreground/90 col-span-2 leading-relaxed [&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-px [&_code]:text-[0.8125rem]">
            {children}
          </dd>
          <dt className="text-muted-foreground">Type</dt>
          <dd className="min-w-0">
            <code className="font-mono text-[0.8125rem] break-words">
              {fullType}
            </code>
          </dd>
          <dt className="text-muted-foreground md:hidden">Default</dt>
          <dd className="md:hidden">
            <code className="font-mono text-[0.8125rem]">
              {defaultValue !== undefined ? defaultValue : "–"}
            </code>
          </dd>
        </dl>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

interface ApiPropsListProps {
  children: ReactNode;
}

export function ApiPropsList({ children }: ApiPropsListProps) {
  return (
    <div className="not-prose my-6 grid grid-cols-[auto_min-content] sm:grid-cols-[auto_minmax(0,1fr)_min-content] md:grid-cols-[auto_minmax(0,1fr)_auto_min-content]">
      <div
        aria-hidden="true"
        className={`text-muted-foreground border-border grid grid-cols-subgrid border-b pb-2 text-xs font-medium ${SPAN_ALL}`}
      >
        <span className="pr-4">Prop</span>
        <span className="hidden pr-4 sm:block">Type</span>
        <span className="hidden pr-4 md:block">Default</span>
        <span />
      </div>
      {children}
    </div>
  );
}
