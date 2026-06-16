"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SECTION_SELECTOR = ".motion-section";
const VISIBLE_CLASS = "section-visible";

export function SectionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const clearObservedSections = () => {
      document.querySelectorAll<HTMLElement>(`${SECTION_SELECTOR}.${VISIBLE_CLASS}`).forEach((section) => {
        section.classList.remove(VISIBLE_CLASS);
      });
    };

    if (pathname?.startsWith("/admin") || pathname === "/login") {
      clearObservedSections();
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMotionQuery = window.matchMedia("(max-width: 767px)");

    if (reducedMotionQuery.matches || mobileMotionQuery.matches) {
      document.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach((section) => {
        section.classList.add(VISIBLE_CLASS);
      });
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));

    if (sections.length === 0) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      sections.forEach((section) => {
        section.classList.add(VISIBLE_CLASS);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target as HTMLElement;
            section.classList.add(VISIBLE_CLASS);
            observer.unobserve(section);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
