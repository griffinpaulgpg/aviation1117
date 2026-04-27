import Image from "next/image";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";
import { siteContent } from "@/lib/site-content";

export default function GalleryPage() {
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Gallery"
          title="Training moments and aviation exposure."
          description="A visual gallery area for academy photos, airport visits, student activities, and classroom memories."
        />
        <section className="py-20">
          <Container className="grid gap-5 md:grid-cols-3">
            {siteContent.gallery.map((item) => (
              <figure key={item.title} className="float-card overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
                <figcaption className="p-5 font-semibold text-foreground">{item.title}</figcaption>
              </figure>
            ))}
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
