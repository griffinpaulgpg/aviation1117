export function scheduleBrowserIdleTask(task: () => void, delayMs = 250, timeoutMs = 1500) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const idleWindow = window as Window &
    typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleId = idleWindow.requestIdleCallback(() => task(), { timeout: timeoutMs });
    return () => idleWindow.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(task, delayMs);
  return () => window.clearTimeout(timeoutId);
}
