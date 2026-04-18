"use client";

import { useEffect, useState } from "react";

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

export function useCopyToClipboard(timeout: number = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), timeout);
      return () => clearTimeout(timer);
    }
  }, [isCopied, timeout]);

  const copyToClipboard = async (text: string) => {
    const success = await writeToClipboard(text);
    if (success) {
      setIsCopied(true);
    }
  };

  return { isCopied, copyToClipboard };
}
