"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { getSafeImageSrc, isValidImageSrc, shouldBypassImageOptimizer } from "@/lib/media";
import type { PublicGalleryData } from "@/lib/public-content-data";
import { loadClientGallery } from "@/src/lib/firebase-client-loaders";

export function GalleryGridClient({ initialGallery }: { initialGallery: PublicGalleryData }) {
  const [gallery, setGallery] = useState(initialGallery);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      try {
        const result = await loadClientGallery();

        if (!cancelled) {
          setGallery(result.gallery);
          setWarning(result.warning);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase gallery unavailable; using fallback gallery.", error);
        }
      }
    }

    void loadGallery();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-6">
      {warning ? (
        <p className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
          {warning}
        </p>
      ) : null}

      {gallery.folders.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-3">
          {gallery.folders.map((folder) => (
            <span
              key={folder.id}
              className="rounded-full border border-sky-100 bg-white/70 px-4 py-2 text-sm font-semibold text-brand-dark"
            >
              {folder.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        {gallery.photos.map((item) => (
          <figure key={item.id ?? item.image} className="premium-card">
            <div className="relative aspect-[4/3]">
              {item.mediaType === "video" ? (
                <video
                  src={item.mediaUrl ?? item.image}
                  controls
                  preload="metadata"
                  poster={item.thumbnailUrl ?? undefined}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={getSafeImageSrc(item.mediaUrl ?? item.image)}
                  alt={item.caption ?? item.alt ?? "Academy gallery photo"}
                  fill
                  loading="lazy"
                  quality={72}
                  unoptimized={shouldBypassImageOptimizer(
                    isValidImageSrc(item.mediaUrl ?? item.image)
                      ? (item.mediaUrl ?? item.image)
                      : undefined,
                  )}
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              )}
            </div>
            <figcaption className="p-5">
              <p className="font-semibold text-foreground">
                {item.caption ?? item.title ?? "Academy photo"}
              </p>
              {item.folderName ? <p className="mt-1 text-sm text-muted">{item.folderName}</p> : null}
              {item.description ? (
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
