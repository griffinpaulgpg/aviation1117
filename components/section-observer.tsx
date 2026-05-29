"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SECTION_SELECTOR = ".observe-section";

export function SectionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    if (pathname?.startsWith("/admin") || pathname === "/login") {
      document.querySelectorAll<HTMLElement>(SECTION_SELECTOR).forEach((section) => {
        section.classList.remove("section-active");
      });
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotionQuery.matches) {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));

    if (sections.length === 0) {
      return;
    }

    const centerCandidates = new Set<HTMLElement>();
    let frameId = 0;

    const updateActiveSection = () => {
      const viewportCenter = window.innerHeight / 2;
      let activeSection: HTMLElement | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      centerCandidates.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          activeSection = section;
        }
      });

      sections.forEach((section) => {
        section.classList.toggle("section-active", section === activeSection);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            centerCandidates.add(section);
          } else {
            centerCandidates.delete(section);
          }
        });

        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }

        frameId = window.requestAnimationFrame(updateActiveSection);
      },
      {
        threshold: [0, 0.01, 0.1, 0.2],
        rootMargin: "-35% 0px -35% 0px",
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    updateActiveSection();

    return () => {
      observer.disconnect();

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      sections.forEach((section) => {
        section.classList.remove("section-active");
      });
    };
  }, [pathname]);

  return null;
}
