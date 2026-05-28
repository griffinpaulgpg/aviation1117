"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { getSafeImageSrc, isValidImageSrc, shouldBypassImageOptimizer } from "@/lib/media";
import type { PublicVideoTestimonial, PublicWrittenTestimonial } from "@/lib/public-content-data";
import { loadClientTestimonials } from "@/src/lib/firebase-client-loaders";

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");

      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop();

      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function TestimonialsClient({
  initialWritten,
  initialVideo,
}: {
  initialWritten: PublicWrittenTestimonial[];
  initialVideo: PublicVideoTestimonial[];
}) {
  const [written, setWritten] = useState(initialWritten);
  const [video, setVideo] = useState(initialVideo);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTestimonials() {
      try {
        const result = await loadClientTestimonials();

        if (!cancelled) {
          setWritten(result.testimonials.written);
          setVideo(result.testimonials.video);
          setWarning(result.warning);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase testimonials unavailable; using fallback testimonials.", error);
        }
      }
    }

    void loadTestimonials();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasTestimonials = written.length > 0 || video.length > 0;

  return (
    <div className="grid gap-20">
      {warning ? (
        <p className="rounded-2xl border border-sky-100 bg-white/75 px-5 py-4 text-sm font-semibold text-muted">
          {warning}
        </p>
      ) : null}

      {written.length > 0 ? (
        <section className="observe-section aviation-section py-20">
          <SectionHeading
            eyebrow="Real Feedback"
            title="Student outcomes and placement confidence."
            description="Stories from students who trained for aviation roles through Arunand's Aviation Academy."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {written.map((testimonial) => (
              <figure key={testimonial.id ?? testimonial.name} className="premium-card p-6">
                {isValidImageSrc(testimonial.photo) ? (
                  <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-sky-50">
                    {(() => {
                      const safeImage = getSafeImageSrc(testimonial.photo);

                      return (
                    <Image
                      src={safeImage}
                      alt={`${testimonial.name} testimonial`}
                      fill
                      loading="lazy"
                      quality={72}
                      unoptimized={shouldBypassImageOptimizer(safeImage)}
                      className="object-cover"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                      );
                    })()}
                  </div>
                ) : null}
                <blockquote className="text-base leading-8 text-muted">
                  “{testimonial.description}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-muted">{testimonial.position}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {video.length > 0 ? (
        <section className="observe-section aviation-section py-20">
          <SectionHeading
            eyebrow="Student Videos"
            title="Video Testimonials"
            description="Student video stories published from the admin dashboard."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {video.map((item) => (
              <article key={item.id ?? item.name} className="premium-card">
                <div className="relative aspect-video bg-brand-dark">
                  {item.video ? (
                    getYouTubeEmbedUrl(item.video) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(item.video) ?? undefined}
                        title={`${item.name} video testimonial`}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={item.video}
                        controls
                        preload="none"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : null}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="mt-1 text-sm text-brand-dark">{item.position}</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!hasTestimonials ? (
        <section className="observe-section aviation-section py-20">
          <div className="premium-card px-6 py-10 text-center">
            <p className="text-lg font-semibold text-brand-dark">Testimonials will be available soon.</p>
          </div>
        </section>
      ) : null}

      <section className="observe-section aviation-section py-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-dark px-6 py-12 text-center text-white shadow-[0_28px_90px_rgb(14_116_144_/_0.20)] sm:px-10">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.28),transparent_16rem),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_42%)]"
            aria-hidden="true"
          />
          <h2 className="text-3xl font-semibold tracking-normal">Want to be our next success story?</h2>
          <Link
            href="/enquiry"
            prefetch={true}
            className="premium-button relative mt-8 inline-flex rounded-full bg-sky-200 px-8 py-3 text-sm font-semibold text-brand-dark transition hover:bg-white"
          >
            Enquire Now
          </Link>
        </div>
      </section>
    </div>
  );
}
