"use client";

import { useEffect } from "react";

const SECTION_SELECTOR = ".observe-section";

export function SectionObserver() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
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

    const visibility = new Map<HTMLElement, number>();
    let frameId = 0;

    const updateActiveSection = () => {
      let activeSection: HTMLElement | null = null;
      let highestRatio = 0;

      sections.forEach((section) => {
        const ratio = visibility.get(section) ?? 0;

        if (ratio > highestRatio) {
          highestRatio = ratio;
          activeSection = section;
        }
      });

      sections.forEach((section) => {
        section.classList.toggle("section-in-view", section === activeSection && highestRatio >= 0.32);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target as HTMLElement, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }

        frameId = window.requestAnimationFrame(updateActiveSection);
      },
      {
        threshold: [0, 0.12, 0.24, 0.35, 0.5, 0.7, 0.85, 1],
        rootMargin: "-4% 0px -18% 0px",
      },
    );

    sections.forEach((section) => {
      visibility.set(section, 0);
      observer.observe(section);
    });

    updateActiveSection();

    return () => {
      observer.disconnect();

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      sections.forEach((section) => {
        section.classList.remove("section-in-view");
      });
    };
  }, []);

  return null;
}
