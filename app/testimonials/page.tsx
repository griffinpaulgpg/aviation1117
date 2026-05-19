/* eslint-disable @next/next/no-html-link-for-pages */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { shouldBypassImageOptimizer } from "@/lib/media";
import { getPublicTestimonials } from "@/lib/public-content-data";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read student testimonials, video testimonials, and placement success stories from Arunand's Aviation Academy.",
  openGraph: {
    title: "Student Testimonials",
    description: "Student voices and success stories from Arunand's Aviation Academy.",
    url: "/testimonials",
  },
};

const testimonialPlaceholders = Array.from({ length: 6 }, (_, index) => ({
  name: `Student Name ${index + 1}`,
  course: "Course name placeholder",
  quote:
    "Arunand's Aviation Academy helped me improve my confidence, grooming, communication skills, and interview preparation. The training gave me the confidence to start my aviation career.",
}));

const videoPlaceholders = Array.from({ length: 4 }, (_, index) => ({
  video: "",
  name: `Student Video ${index + 1}`,
  description: "Short description placeholder for the student video testimonial.",
}));

const placementPlaceholders = Array.from({ length: 6 }, (_, index) => ({
  name: `Student Name ${index + 1}`,
  company: "Airline/company name",
  role: "Position/job role",
}));

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

export default async function TestimonialsPage() {
  const testimonials = await getPublicTestimonials();
  const videoTestimonials =
    testimonials.video.length > 0
      ? testimonials.video
      : videoPlaceholders.map((video) => ({
          ...video,
          position: "Student",
        }));

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Testimonials"
          title="Student Testimonials"
          description="Hear from our students about their journey with Arunand's Aviation Academy."
        />

        {testimonials.written.length > 0 ? (
          <section className="aviation-section py-20">
            <Container>
              <SectionHeading
                eyebrow="Real Feedback"
                title="Student outcomes and placement confidence."
                description="Stories from students who trained for aviation roles through Arunand's Aviation Academy."
              />
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {testimonials.written.map((testimonial) => (
                  <figure key={testimonial.name} className="premium-card p-6">
                    {testimonial.photo ? (
                      <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-sky-50">
                        <Image
                          src={testimonial.photo}
                          alt={`${testimonial.name} testimonial`}
                          fill
                          loading="lazy"
                          quality={72}
                          unoptimized={shouldBypassImageOptimizer(testimonial.photo)}
                          className="object-cover"
                          sizes="(min-width: 768px) 50vw, 100vw"
                        />
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
            </Container>
          </section>
        ) : null}

        <section className="aviation-section bg-white/54 py-20">
          <Container>
            <SectionHeading
              eyebrow="Student Voices"
              title="Student Testimonials"
              description="Placeholder testimonials can be replaced with student photos, course names, and real feedback from the academy."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {testimonialPlaceholders.map((testimonial) => (
                <article key={testimonial.name} className="premium-card flex h-full flex-col p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark">
                      Photo
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                      <p className="mt-1 text-sm text-muted">{testimonial.course}</p>
                    </div>
                  </div>
                  <p className="mt-5 flex-1 text-sm leading-7 text-muted">{testimonial.quote}</p>
                  <div
                    className="mt-5 flex items-center gap-2"
                    aria-label="Star rating placeholder"
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className="size-3 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark">
                      Rating
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="aviation-section py-20">
          <Container>
            <SectionHeading
              eyebrow="Student Videos"
              title="Video Testimonials"
              description="Responsive video testimonial placeholders for student interview clips and short success stories."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {videoTestimonials.map((video) => (
                <article key={video.name} className="premium-card">
                  <div className="relative aspect-video bg-brand-dark">
                    {video.video ? (
                      getYouTubeEmbedUrl(video.video) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(video.video) ?? undefined}
                          title={`${video.name} video testimonial`}
                          className="absolute inset-0 h-full w-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={video.video}
                          controls
                          preload="none"
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(93,173,226,0.24),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.16),_transparent)]" />
                        <div className="absolute inset-6 rounded-lg border border-white/20" />
                        <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-brand-dark" />
                        </div>
                        <p className="absolute bottom-5 left-5 text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
                          Video thumbnail
                        </p>
                      </>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground">{video.name}</h3>
                    <p className="mt-1 text-sm text-brand-dark">{video.position}</p>
                    <p className="mt-2 text-sm leading-7 text-muted">{video.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="aviation-section bg-white/54 py-20">
          <Container>
            <SectionHeading
              eyebrow="Placements"
              title="Our Student Success Stories"
              description="A clean space for placement photos, company names, and student career outcomes."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {placementPlaceholders.map((placement) => (
                <article key={placement.name} className="premium-card">
                  <div className="flex aspect-[4/3] items-center justify-center bg-accent/15 text-sm font-semibold uppercase tracking-[0.14em] text-brand-dark">
                    Placement photo
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground">{placement.name}</h3>
                    <p className="mt-2 text-sm text-muted">{placement.company}</p>
                    <p className="mt-1 text-sm font-semibold text-brand-dark">{placement.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="aviation-section py-20">
          <Container>
            <div className="relative overflow-hidden rounded-3xl bg-brand-dark px-6 py-12 text-center text-white shadow-[0_28px_90px_rgb(14_116_144_/_0.20)] sm:px-10">
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.28),transparent_16rem),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_42%)]"
                aria-hidden="true"
              />
              <h2 className="text-3xl font-semibold tracking-normal">
                Want to be our next success story?
              </h2>
              <Link
                href="/enquiry"
                prefetch={true}
                className="premium-button relative mt-8 inline-flex rounded-full bg-sky-200 px-8 py-3 text-sm font-semibold text-brand-dark transition hover:bg-white"
              >
                Enquire Now
              </Link>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
