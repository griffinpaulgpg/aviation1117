import type { Metadata } from "next";

import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { TestimonialsClient } from "@/components/testimonials-client";

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

export default function TestimonialsPage() {

  return (
    <>
      <main className="site-sky public-page">
        <PageHero
          eyebrow="Testimonials"
          title="Student Testimonials"
          description="Hear from our students about their journey with Arunand's Aviation Academy."
        />
        <section className="motion-section observe-section aviation-section py-20">
          <Container>
            <TestimonialsClient initialWritten={[]} initialVideo={[]} />
          </Container>
        </section>
      </main>
    </>
  );
}
