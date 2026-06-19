"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SECTION_SELECTOR = ".motion-section";
const ACTIVE_CLASS = "section-active";

export function SectionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const clearObservedSections = () => {
      document.querySelectorAll<HTMLElement>(`${SECTION_SELECTOR}.${ACTIVE_CLASS}`).forEach((section) => {
        section.classList.remove(ACTIVE_CLASS);
      });
    };

    if (pathname?.startsWith("/admin") || pathname === "/login") {
      clearObservedSections();
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotionQuery.matches) {
      clearObservedSections();
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));

    if (sections.length === 0) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      sections[0]?.classList.add(ACTIVE_CLASS);
      return;
    }

    const activeCandidates = new Map<Element, number>();

    const setActiveSection = () => {
      const nextActive = Array.from(activeCandidates.entries())
        .sort((left, right) => right[1] - left[1])[0]?.[0] as HTMLElement | undefined;

      sections.forEach((section) => {
        section.classList.toggle(ACTIVE_CLASS, section === nextActive);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeCandidates.set(entry.target, entry.intersectionRatio);
          } else {
            activeCandidates.delete(entry.target);
          }
        });

        setActiveSection();
      },
      {
        rootMargin: "-42% 0px -42% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
