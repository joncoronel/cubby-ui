"use client";

import { useCallback, useEffect, useState } from "react";

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      return success;
    } catch {
      return false;
    }
  }
}

export interface UseCopyToClipboardOptions {
  /** ms before `isCopied`/`isError` auto-resets. Pass `null` to disable (e.g. when another mechanism owns the lifecycle). */
  timeout?: number | null;
  onCopied?: (text: string) => void;
  onCopyError?: (text: string) => void;
}

export function useCopyToClipboard({
  timeout = 2000,
  onCopied,
  onCopyError,
}: UseCopyToClipboardOptions = {}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (status !== "idle" && timeout != null) {
      const timer = setTimeout(() => setStatus("idle"), timeout);
      return () => clearTimeout(timer);
    }
  }, [status, timeout]);

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      const success = await writeToClipboard(text);
      if (success) {
        setStatus("copied");
        onCopied?.(text);
      } else {
        setStatus("error");
        onCopyError?.(text);
      }
      return success;
    },
    [onCopied, onCopyError],
  );

  const reset = useCallback(() => setStatus("idle"), []);

  return {
    isCopied: status === "copied",
    isError: status === "error",
    copyToClipboard,
    reset,
  };
}
