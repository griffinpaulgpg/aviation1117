import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { SiteFrame } from "@/components/site-frame";
import { StatCard } from "@/components/stat-card";
import { siteContent } from "@/lib/site-content";

export default function HomePage() {
  return (
    <SiteFrame>
      <main>
        <section className="relative overflow-hidden bg-brand-dark text-white">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2200&q=85"
            alt="Aircraft wing above clouds"
            fill
            priority
            className="opacity-32 object-cover"
            sizes="100vw"
          />
          <div className="via-brand-dark/86 to-brand-dark/48 absolute inset-0 bg-gradient-to-r from-brand-dark" />
          <Container className="relative grid min-h-[calc(100vh-5rem)] items-center gap-10 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                Aviation training academy
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
                {siteContent.home.headline}
              </h1>
              <p className="text-white/78 mt-6 max-w-2xl text-lg leading-8">
                {siteContent.home.intro}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-brand-dark transition hover:bg-white"
                >
                  {siteContent.home.primaryCta}
                </Link>
                <Link
                  href="/courses"
                  className="border-white/24 rounded-full border px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  {siteContent.home.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {siteContent.stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-border bg-white py-20 sm:py-24">
          <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="relative min-h-96 overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1600&q=85"
                alt="Airport terminal interior"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
            <div>
              <SectionHeading eyebrow={siteContent.about.eyebrow} title={siteContent.about.title} />
              <div className="mt-6 space-y-5 text-base leading-8 text-muted">
                {siteContent.about.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {siteContent.highlights.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-lg border border-border bg-background p-5"
                  >
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-20 sm:py-24">
          <Container>
            <SectionHeading
              eyebrow="Services"
              title="Training support beyond the classroom."
              description="This service overview stays on the home page because it does not have a separate public page yet."
            />
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {siteContent.services.map((service, index) => (
                <div key={service} className="rounded-lg border border-border bg-white p-5">
                  <p className="text-sm font-semibold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 font-medium text-foreground">{service}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="border-y border-border bg-white py-16">
          <Container className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Need admissions help?
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
                Go to the contact page for enquiry and chat.
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Open Contact Page
            </Link>
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
