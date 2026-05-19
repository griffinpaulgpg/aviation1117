"use client";

import dynamic from "next/dynamic";

const FloatingChatbot = dynamic(
  () => import("@/components/floating-chatbot").then((module) => module.FloatingChatbot),
  {
    ssr: false,
  },
);

const FloatingWhatsAppButton = dynamic(
  () =>
    import("@/components/floating-whatsapp-button").then(
      (module) => module.FloatingWhatsAppButton,
    ),
  {
    ssr: false,
  },
);

export function FloatingWidgetsClient() {
  return (
    <>
      <FloatingChatbot />
      <FloatingWhatsAppButton />
    </>
  );
}
