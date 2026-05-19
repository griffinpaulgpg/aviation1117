/* eslint-disable @next/next/no-html-link-for-pages */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { shouldBypassImageOptimizer } from "@/lib/media";
import { getPublicEvents } from "@/lib/public-content-data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "View aviation academy events, airport visits, guest sessions, mock interview weeks, and student programs.",
  openGraph: {
    title: "Aviation Academy Events",
    description: "Programs and industry exposure activities at Arunand's Aviation Academy.",
    url: "/events",
  },
};

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Events"
          title="Programs, visits, and industry sessions."
          description="Keep upcoming airport visits, mock interview weeks, guest lectures, and student events organized in one professional page."
        />
        <section className="aviation-section py-20">
          <Container className="grid gap-5 md:grid-cols-3">
            {events.map((event) => (
              <article key={event.title} className="premium-card p-6">
                {event.image ? (
                  <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl bg-sky-50">
                    <Image
                      src={event.image}
                      alt={`${event.title} event`}
                      fill
                      loading="lazy"
                      quality={72}
                      unoptimized={shouldBypassImageOptimizer(event.image)}
                      className="object-cover"
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                  </div>
                ) : null}
                {event.date ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                    {event.date}
                  </p>
                ) : null}
                <h2 className="mt-4 text-2xl font-semibold text-foreground">{event.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted">{event.description}</p>
                {event.applyLink ? (
                  event.applyLink.startsWith("/") ? (
                    <Link
                      href={event.applyLink}
                      prefetch={true}
                      className="premium-button mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
                    >
                      Apply
                    </Link>
                  ) : (
                    <a
                      href={event.applyLink}
                      className="premium-button mt-6 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
                    >
                      Apply
                    </a>
                  )
                ) : null}
              </article>
            ))}
          </Container>
        </section>
      </main>
    </>
  );
}
