"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { scheduleBrowserIdleTask } from "@/src/lib/browser-idle";

const FloatingWidgetsClient = dynamic(
  () => import("@/components/floating-widgets-client").then((module) => module.FloatingWidgetsClient),
  { ssr: false },
);

export function RootClientEnhancements() {
  const [shouldLoadWidgets, setShouldLoadWidgets] = useState(false);

  useEffect(() => {
    return scheduleBrowserIdleTask(() => setShouldLoadWidgets(true), 2500, 6000);
  }, []);

  return (
    <>
      {shouldLoadWidgets ? <FloatingWidgetsClient /> : null}
    </>
  );
}
