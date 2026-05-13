/* eslint-disable @next/next/no-html-link-for-pages */

import Image from "next/image";

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
          <div className="hero-orbit md:block" aria-hidden="true" />
          <div className="hero-cloud hero-cloud-one lg:block" aria-hidden="true" />
          <div className="hero-cloud hero-cloud-two lg:block" aria-hidden="true" />
          <Image
            src="/hero-plane-clouds.webp"
            alt="Airplane flying through a bright blue sky with clouds"
            fill
            priority
            quality={82}
            className="object-cover object-center opacity-95"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/50 to-sky-100/10" />
          <Container className="relative flex min-h-[calc(100vh-5rem)] flex-col justify-center gap-8 py-20">
            <div className="home-glass max-w-4xl p-6 sm:p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                Aviation training academy
              </p>
              <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-normal sm:text-6xl lg:text-7xl">
                {siteContent.home.headline}
              </h1>
              <p className="text-white/78 mt-6 max-w-3xl text-lg leading-8">
                {siteContent.home.intro}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/enquiry"
                  className="premium-button rounded-full bg-sky-200 px-6 py-3 text-center text-sm font-semibold text-brand-dark transition hover:bg-white"
                >
                  {siteContent.home.primaryCta}
                </a>
                <a
                  href="/courses"
                  className="premium-button border-white/24 rounded-full border px-6 py-3 text-center text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  {siteContent.home.secondaryCta}
                </a>
              </div>
            </div>
            <div className="home-stat-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {siteContent.stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </Container>
        </section>

        <section className="home-about-section aviation-section py-20 sm:py-24">
          <Container className="home-panel grid gap-10 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="home-photo-contain home-photo-lift relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl p-3">
              <Image
                src="/aassc-affiliation.webp"
                alt="Arunand's Aviation Academy affiliated training partner with AASSC"
                width={1324}
                height={990}
                loading="lazy"
                quality={72}
                className="h-full w-full rounded-lg object-contain"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                {siteContent.about.title}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-7 text-muted">
                {siteContent.about.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="home-courses-section aviation-section py-20 sm:py-24">
          <Container className="home-panel grid gap-12 bg-white/70 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="home-color-strip mb-7 h-2 w-28 rounded-full" />
              <p className="text-lg font-semibold text-brand">Courses we offer</p>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                We Are The Best Aviation In Town
              </h2>
              <a
                href="/courses"
                className="premium-button mt-8 inline-flex rounded-2xl bg-brand px-7 py-4 text-sm font-semibold tracking-[0.2em] text-white transition hover:bg-brand-dark"
              >
                About Us
              </a>
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

        <section className="home-affiliation-section aviation-section py-20 sm:py-24">
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
                  src="/home-students.webp"
                  alt="Aviation students in professional training"
                  fill
                  loading="lazy"
                  quality={72}
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
                  src="/home-cabin-training.webp"
                  alt="Cabin crew training group"
                  fill
                  loading="lazy"
                  quality={72}
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, 100vw"
                />
              </div>
            </div>
          </Container>
        </section>

        <section className="home-services-section aviation-section py-20 sm:py-24">
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
