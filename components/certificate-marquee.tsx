"use client";

import Image from "next/image";
import { useState } from "react";

import { getReadableErrorMessage } from "@/lib/error-utils";

export type CertificateAchievement = {
  image: string;
  title: string;
  description: string;
};

type CertificateMarqueeProps = {
  certificates: CertificateAchievement[];
};

export function CertificateMarquee({ certificates }: CertificateMarqueeProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  return (
    <div className="certificate-scroll mt-12" aria-label="Certificates and achievements">
      <div className="certificate-scroll-track">
        {certificates.map((certificate) => {
          const showImage = !failedImages.has(certificate.image);
          return (
            <article
              key={certificate.image}
              className="premium-card certificate-scroll-card p-4"
            >
              <div className="certificate-frame">
                {showImage ? (
                  <Image
                    src={certificate.image}
                    alt={certificate.title}
                    fill
                    loading="lazy"
                    fetchPriority="low"
                    quality={72}
                    unoptimized
                    className="object-contain object-center"
                    sizes="(min-width: 1280px) 384px, (min-width: 768px) 320px, 82vw"
                    onError={(error) => {
                      console.error(
                        "Handled certificate image load error:",
                        getReadableErrorMessage(error, "Image failed to load"),
                        error,
                      );
                      setFailedImages((current) => new Set(current).add(certificate.image));
                    }}
                  />
                ) : (
                  <div className="certificate-placeholder" role="img" aria-label={certificate.title}>
                    <span className="certificate-placeholder-badge">Certificate</span>
                    <p className="certificate-placeholder-copy">
                      Image temporarily unavailable
                    </p>
                  </div>
                )}
              </div>
              <div className="certificate-copy mt-5 px-1 pb-1">
                <h3 className="text-lg font-semibold text-foreground">{certificate.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{certificate.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
