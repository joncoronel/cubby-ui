"use client";

import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface ApiPropProps {
  name: string;
  fullType: string;
  /** A short type for the row, when the full one is long. */
  simpleType?: string;
  defaultValue?: string;
  required?: boolean;
  children: ReactNode;
}

/** A type this long can't fit the row on one line, so it's cut short there. */
const LONG_TYPE = 48;
/** A default this long may be cut short on a phone, so the open row shows it. */
const LONG_DEFAULT = 16;

/**
 * One prop as a row that opens: one line carries what you scan for (name,
 * required, the type, cut short when it runs out of room, and the default,
 * so a phone isn't left with bare names), and opens to what the prop does,
 * plus the full type where the row may have shortened it (the open row
 * used to repeat the type the row already showed).
 */
export function ApiProp({
  name,
  fullType,
  simpleType,
  defaultValue,
  required = false,
  children,
}: ApiPropProps) {
  const rowType = simpleType ?? fullType;
  const showFullType =
    (simpleType !== undefined && simpleType !== fullType) ||
    fullType.length > LONG_TYPE;

  return (
    <Collapsible.Root data-slot="api-prop" className="docs-prop">
      <Collapsible.Trigger className="docs-prop-trigger">
        <span className="docs-prop-head">
          <code className="docs-prop-name">{name}</code>
          {required && <span className="docs-prop-required">required</span>}
          <code className="docs-prop-type">{rowType}</code>
          {defaultValue !== undefined && (
            <span className="docs-prop-default">
              <span>Default</span>
              <code>{defaultValue}</code>
            </span>
          )}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            aria-hidden="true"
            className="docs-prop-chevron"
          />
        </span>
      </Collapsible.Trigger>

      <Collapsible.Panel className="docs-prop-panel">
        <div className="docs-prop-body">
          <div className="docs-prop-desc">{children}</div>
          {/* Whole here wherever the row may have cut it short: always for a
              long type, and on a narrow screen for any. */}
          <p
            className="docs-prop-full"
            data-long={showFullType ? "" : undefined}
          >
            <span>Type</span>
            <code>{fullType}</code>
          </p>
          {defaultValue !== undefined && defaultValue.length > LONG_DEFAULT && (
            <p className="docs-prop-full" data-long="">
              <span>Default</span>
              <code>{defaultValue}</code>
            </p>
          )}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

interface ApiPropsListProps {
  children: ReactNode;
}

export function ApiPropsList({ children }: ApiPropsListProps) {
  return <div className="docs-props not-prose">{children}</div>;
}
