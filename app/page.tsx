import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { SiteFrame } from "@/components/site-frame";
import { StatCard } from "@/components/stat-card";
import { siteContent } from "@/lib/site-content";

const offeredCourses = [
  "Cabin Crew",
  "Ground Handling",
  "Hospitality",
  "Airline Operations",
  "Airport Operations",
  "Air Cargo & Logistics",
];

export default function HomePage() {
  return (
    <SiteFrame>
      <main className="home-canvas">
        <section className="home-hero relative overflow-hidden bg-brand-dark text-white">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2200&q=85"
            alt="Aircraft wing above clouds"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="via-brand-dark/82 to-brand-dark/36 absolute inset-0 bg-gradient-to-r from-brand-dark" />
          <Container className="relative grid min-h-[calc(100vh-5rem)] items-center gap-10 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="home-glass p-6 sm:p-8">
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
            <div className="home-stat-grid grid grid-cols-2 gap-4">
              {siteContent.stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </Container>
        </section>

        <section className="py-20 sm:py-24">
          <Container className="home-panel grid gap-10 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="home-photo-contain home-photo-lift relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl p-3">
              <Image
                src="/aassc-affiliation.png"
                alt="Arunand's Aviation Academy affiliated training partner with AASSC"
                width={1324}
                height={990}
                className="h-full w-full rounded-lg object-contain"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
            <div className="mx-auto max-w-2xl lg:mx-0">
              <SectionHeading eyebrow={siteContent.about.eyebrow} title={siteContent.about.title} />
              <div className="mt-6 space-y-4 text-base leading-7 text-muted">
                {siteContent.about.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-20 sm:py-24">
          <Container className="home-panel grid gap-12 bg-[#f0f2f4]/80 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="home-color-strip mb-7 h-2 w-28 rounded-full" />
              <p className="text-lg font-semibold text-brand">Courses we offer</p>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                We Are The Best Aviation In Town
              </h2>
              <Link
                href="/courses"
                className="mt-8 inline-flex rounded-lg bg-brand px-7 py-4 text-sm font-semibold tracking-[0.2em] text-white transition hover:bg-brand-dark"
              >
                About Us
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {offeredCourses.map((course) => (
                <div
                  key={course}
                  className="home-course-card flex items-center gap-4 p-4 text-lg font-semibold"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-[10px] text-white shadow-lg">
                    ▶
                  </span>
                  <span>{course}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-20 sm:py-24">
          <Container className="grid gap-12">
            <div className="home-logo-band rounded-2xl p-5 sm:p-8">
              <div className="grid gap-4 rounded-xl bg-white p-8 text-center sm:grid-cols-3 sm:items-center">
                <div>
                  <p className="text-3xl font-semibold text-brand">NSDC</p>
                  <p className="mt-2 text-sm font-medium text-muted">
                    National Skill Development Corporation
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-brand">AASSC</p>
                  <p className="mt-2 text-sm font-medium text-muted">
                    Aerospace & Aviation Sector Skill Council
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-brand-dark">Skill India</p>
                  <p className="mt-2 text-sm font-medium text-muted">Government skill initiative</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr_0.85fr] lg:items-center">
              <div className="home-photo-lift relative min-h-72 overflow-hidden rounded-xl">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85"
                  alt="Aviation students in professional training"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, 100vw"
                />
              </div>
              <div className="home-panel p-6 text-center">
                <p className="text-2xl font-semibold uppercase leading-10 text-foreground">
                  Top University BBA Aviation Curriculum Writer Built Our Curriculum
                </p>
                <p className="mt-8 text-3xl leading-tight text-foreground">
                  An Aviation Academy With Focus On
                </p>
                <p className="mt-8 text-3xl font-semibold leading-tight text-foreground">
                  Cabin Crew | Ground Handling | Airport Operations | Airline Operations |
                  Hospitality
                </p>
              </div>
              <div className="home-photo-lift relative min-h-72 overflow-hidden rounded-xl">
                <Image
                  src="https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&w=1000&q=85"
                  alt="Cabin crew training group"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, 100vw"
                />
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
              {siteContent.services.slice(0, 6).map((service, index) => (
                <div key={service} className="home-course-card p-5">
                  <p className="text-sm font-semibold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 font-medium text-foreground">{service}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
