"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { CertificateAchievement } from "@/components/certificate-marquee";

const CertificateMarquee = dynamic(
  () => import("@/components/certificate-marquee").then((module) => module.CertificateMarquee),
  {
    ssr: false,
    loading: () => <div className="certificate-marquee-placeholder" aria-hidden="true" />,
  },
);

type LazyCertificateMarqueeProps = {
  certificates: CertificateAchievement[];
};

export function LazyCertificateMarquee({ certificates }: LazyCertificateMarqueeProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = rootRef.current;

    if (!node || shouldLoad) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "96px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={rootRef}>
      {shouldLoad ? (
        <CertificateMarquee certificates={certificates} />
      ) : (
        <div className="certificate-marquee-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}
