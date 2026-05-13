import Image from "next/image";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";
import { getPublicGallery } from "@/lib/content-data";
import { shouldBypassImageOptimizer } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const gallery = await getPublicGallery();

  return (
    <SiteFrame>
      <main className="site-sky">
        <PageHero
          eyebrow="Gallery"
          title="Training moments and aviation exposure."
          description="A visual gallery area for academy photos, airport visits, student activities, and classroom memories."
        />
        <section className="aviation-section py-20">
          <Container>
            {gallery.folders.length > 0 ? (
              <div className="mb-8 flex flex-wrap gap-3">
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
                    <Image
                      src={item.image}
                      alt={item.caption ?? item.alt ?? "Academy gallery photo"}
                      fill
                      loading="lazy"
                      quality={72}
                      unoptimized={shouldBypassImageOptimizer(item.image)}
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                  <figcaption className="p-5">
                    <p className="font-semibold text-foreground">
                      {item.caption ?? item.title ?? "Academy photo"}
                    </p>
                    {item.folderName ? (
                      <p className="mt-1 text-sm text-muted">{item.folderName}</p>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
