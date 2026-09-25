"use client";

import * as React from "react";

export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const STORAGE_KEY = "cubby-ui:package-manager";
const listeners = new Set<() => void>();
let current: PackageManager | null = null;

function read(): PackageManager {
  if (current) return current;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (PACKAGE_MANAGERS as readonly string[]).includes(stored)) {
      current = stored as PackageManager;
      return current;
    }
  } catch {
    // Storage can be unavailable (private mode); fall through to the default.
  }
  current = "npm";
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      current = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * One package-manager choice shared by every command block on the site, and
 * remembered across visits. Picking pnpm once switches them all.
 */
export function usePackageManager(): [
  PackageManager,
  (next: PackageManager) => void,
] {
  const value = React.useSyncExternalStore<PackageManager>(
    subscribe,
    read,
    () => "npm",
  );

  const set = React.useCallback((next: PackageManager) => {
    current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-persistent is fine.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [value, set];
}
