import type { Metadata } from "next";

import { Container } from "@/components/container";
import { EventsGridClient } from "@/components/events-grid-client";
import { PageHero } from "@/components/page-hero";
import { siteContent } from "@/lib/site-content";

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

export default function EventsPage() {
  const events = siteContent.events.map((event, index) => ({
    id: `fallback-event-${index}`,
    title: event.title,
    description: event.description,
    image: "/home-students.webp",
    applyLink: "/enquiry",
    date: event.date,
    location: null,
    status: "active" as const,
    order: index,
  }));

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Events"
          title="Programs, visits, and industry sessions."
          description="Keep upcoming airport visits, mock interview weeks, guest lectures, and student events organized in one professional page."
        />
        <section className="motion-section observe-section aviation-section py-20">
          <Container>
            <EventsGridClient initialEvents={events} />
          </Container>
        </section>
      </main>
    </>
  );
}
