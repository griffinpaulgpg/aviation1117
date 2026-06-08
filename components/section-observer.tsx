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

    const clearActiveSections = () => {
      document.querySelectorAll<HTMLElement>(`${SECTION_SELECTOR}.${ACTIVE_CLASS}`).forEach((section) => {
        section.classList.remove(ACTIVE_CLASS);
      });
    };

    if (pathname?.startsWith("/admin") || pathname === "/login") {
      clearActiveSections();
      return;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotionQuery.matches) {
      clearActiveSections();
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));

    if (sections.length === 0) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      clearActiveSections();
      return;
    }

    const centerCandidates = new Set<HTMLElement>();
    let activeSection: HTMLElement | null = null;
    let frameId = 0;

    const setActiveSection = (nextSection: HTMLElement | null) => {
      if (activeSection === nextSection) {
        return;
      }

      activeSection?.classList.remove(ACTIVE_CLASS);
      nextSection?.classList.add(ACTIVE_CLASS);
      activeSection = nextSection;
    };

    const updateActiveSection = () => {
      frameId = 0;

      const candidates =
        centerCandidates.size > 0
          ? Array.from(centerCandidates)
          : sections.filter((section) => {
              const rect = section.getBoundingClientRect();
              return rect.bottom > 0 && rect.top < window.innerHeight;
            });

      if (candidates.length === 0) {
        setActiveSection(null);
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      let closestSection: HTMLElement | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      candidates.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = section;
        }
      });

      setActiveSection(closestSection);
    };

    const scheduleUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateActiveSection);
      }
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

        scheduleUpdate();
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    scheduleUpdate();

    return () => {
      observer.disconnect();

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      centerCandidates.clear();
      clearActiveSections();
    };
  }, [pathname]);

  return null;
}
