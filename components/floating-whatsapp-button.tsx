"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@/src/lib/firebase";

const whatsappMessage =
  "Hello Arunand's Aviation Academy, I would like to know more about your courses.";
const whatsappUrl = `https://wa.me/9036960521?text=${encodeURIComponent(whatsappMessage)}`;

export function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadWhatsAppSetting() {
      try {
        const settingsSnapshot = await getDoc(doc(db, "settings", "global"));
        const settings = settingsSnapshot.exists() ? settingsSnapshot.data() : null;

        if (!cancelled && typeof settings?.whatsappEnabled === "boolean") {
          setIsEnabled(settings.whatsappEnabled);
        }
      } catch {
        if (!cancelled) {
          setIsEnabled(true);
        }
      }
    }

    void loadWhatsAppSetting();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isEnabled || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_rgba(37,211,102,0.35)] ring-1 ring-white/60 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#1EBE5D] hover:shadow-[0_22px_48px_rgba(37,211,102,0.45)] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 md:bottom-7 md:right-7 md:h-16 md:w-16"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-8 w-8 md:h-9 md:w-9"
        fill="currentColor"
      >
        <path d="M16.04 2.67A13.24 13.24 0 0 0 4.7 22.75L3.33 29.33l6.72-1.58A13.23 13.23 0 1 0 16.04 2.67Zm0 2.42a10.81 10.81 0 0 1 9.13 16.6 10.85 10.85 0 0 1-13.98 3.68l-.45-.24-3.97.93.82-3.89-.27-.47A10.82 10.82 0 0 1 16.04 5.09Zm-4.47 5.62c-.24 0-.62.09-.95.45-.32.36-1.25 1.22-1.25 2.98s1.28 3.46 1.46 3.7c.18.24 2.48 3.98 6.1 5.42 3.01 1.19 3.63.95 4.28.89.65-.06 2.1-.86 2.4-1.69.3-.83.3-1.54.21-1.69-.09-.15-.33-.24-.69-.42-.36-.18-2.1-1.04-2.43-1.16-.33-.12-.57-.18-.81.18-.24.36-.93 1.16-1.14 1.4-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.95-1.79-2.13-2-2.49-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.8-1.98-1.13-2.7-.3-.7-.61-.59-.84-.6h-.57Z" />
      </svg>
    </a>
  );
}
