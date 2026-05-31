"use client";

import dynamic from "next/dynamic";

const FloatingWidgetsClient = dynamic(
  () => import("@/components/floating-widgets-client").then((module) => module.FloatingWidgetsClient),
  { ssr: false },
);

const SectionObserver = dynamic(
  () => import("@/components/section-observer").then((module) => module.SectionObserver),
  { ssr: false },
);

export function RootClientEnhancements() {
  return (
    <>
      <SectionObserver />
      <FloatingWidgetsClient />
    </>
  );
}
