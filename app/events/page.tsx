import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";
import { siteContent } from "@/lib/site-content";

export default function EventsPage() {
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Events"
          title="Programs, visits, and industry sessions."
          description="Keep upcoming airport visits, mock interview weeks, guest lectures, and student events organized in one professional page."
        />
        <section className="py-20">
          <Container className="grid gap-5 md:grid-cols-3">
            {siteContent.events.map((event) => (
              <article key={event.title} className="float-card p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  {event.date}
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">{event.title}</h2>
                <p className="mt-4 text-sm leading-7 text-muted">{event.description}</p>
              </article>
            ))}
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
