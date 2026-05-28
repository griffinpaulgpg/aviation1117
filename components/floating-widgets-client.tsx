"use client";

import { useEffect, useState } from "react";

import { FloatingChatbot } from "@/components/floating-chatbot";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";

export function FloatingWidgetsClient() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onIdle = () => setIsReady(true);

    const idleWindow = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

    if (typeof idleWindow.requestIdleCallback === "function") {
      const id = idleWindow.requestIdleCallback(onIdle, { timeout: 1200 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }

    const timeoutId = window.setTimeout(onIdle, 300);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <FloatingChatbot />
      <FloatingWhatsAppButton />
    </>
  );
}
