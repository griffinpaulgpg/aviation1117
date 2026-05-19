"use client";

import Image from "next/image";
import { useState } from "react";

export type PlacementLogo = {
  name: string;
  image?: string;
  width: number;
  height: number;
};

type PlacementLogoMarqueeProps = {
  logos: PlacementLogo[];
};

export function PlacementLogoMarquee({ logos }: PlacementLogoMarqueeProps) {
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const marqueeLogos = [...logos, ...logos];

  return (
    <div className="placement-marquee mt-8" aria-label="Placement companies">
      <div className="placement-marquee-track">
        {marqueeLogos.map((company, index) => {
          const isDuplicate = index >= logos.length;
          const imageSrc = company.image;
          const showLogo = Boolean(imageSrc) && !failedLogos.has(company.name);

          return (
            <article
              key={`${company.name}-${index}`}
              className="placement-logo-card"
              aria-hidden={isDuplicate}
            >
              <div className="placement-logo-frame">
                {showLogo && imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={isDuplicate ? "" : `${company.name} logo`}
                    width={company.width}
                    height={company.height}
                    loading="lazy"
                    className="placement-logo-image"
                    sizes="(min-width: 768px) 15rem, 11rem"
                    onError={() =>
                      setFailedLogos((current) => new Set(current).add(company.name))
                    }
                  />
                ) : (
                  <span className="text-center text-sm font-semibold text-brand-dark">
                    {company.name}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
