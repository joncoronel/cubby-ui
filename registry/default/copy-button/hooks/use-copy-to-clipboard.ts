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
  /** ms before `isCopied` auto-resets. Pass `null` to disable (e.g. when another mechanism owns the lifecycle). */
  timeout?: number | null;
  onCopied?: (text: string) => void;
}

export function useCopyToClipboard({
  timeout = 2000,
  onCopied,
}: UseCopyToClipboardOptions = {}) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied && timeout != null) {
      const timer = setTimeout(() => setIsCopied(false), timeout);
      return () => clearTimeout(timer);
    }
  }, [isCopied, timeout]);

  const copyToClipboard = useCallback(
    async (text: string) => {
      const success = await writeToClipboard(text);
      if (success) {
        setIsCopied(true);
        onCopied?.(text);
      }
    },
    [onCopied],
  );

  const reset = useCallback(() => setIsCopied(false), []);

  return { isCopied, copyToClipboard, reset };
}
