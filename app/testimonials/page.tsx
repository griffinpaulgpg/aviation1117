import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";
import { siteContent } from "@/lib/site-content";

export default function TestimonialsPage() {
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Testimonials"
          title="Student outcomes and placement confidence."
          description="Stories from students who trained for aviation roles through Arunand's Aviation Academy."
        />
        <section className="py-20">
          <Container className="grid gap-5 md:grid-cols-2">
            {siteContent.testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-lg border border-border bg-white p-6 shadow-sm"
              >
                <blockquote className="text-base leading-8 text-muted">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-muted">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
