import type { Metadata } from "next";

import { Container } from "@/components/container";
import { GalleryGridClient } from "@/components/gallery-grid-client";
import { PageHero } from "@/components/page-hero";
import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "See Arunand's Aviation Academy training moments, student activities, classroom sessions, and aviation exposure photos.",
  openGraph: {
    title: "Academy Gallery",
    description: "Photos from aviation training, academy life, airport visits, and student activities.",
    url: "/gallery",
  },
};

export default function GalleryPage() {
  const gallery = {
    folders: [],
    photos: siteContent.gallery.map((photo, index) => ({
      id: `fallback-gallery-${index}`,
      image: photo.image,
      mediaType: "image" as const,
      mediaUrl: photo.image,
      thumbnailUrl: null,
      description: null,
      caption: photo.title,
      folderId: null,
      folderName: null,
      title: photo.title,
      alt: photo.alt,
      status: "active" as const,
      order: index,
    })),
  };

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Gallery"
          title="Training moments and aviation exposure."
          description="A visual gallery area for academy photos, airport visits, student activities, and classroom memories."
        />
        <section className="observe-section aviation-section py-20">
          <Container>
            <GalleryGridClient initialGallery={gallery} />
          </Container>
        </section>
      </main>
    </>
  );
}
