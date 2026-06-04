/* eslint-disable @next/next/no-html-link-for-pages */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { PlacementLogoMarquee, type PlacementLogo } from "@/components/placement-logo-marquee";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Aviation Training Academy in Bangalore",
  description:
    "Arunand's Aviation Academy offers aviation and air cargo certificate courses with grooming, practical exposure, and placement-oriented training in Bangalore.",
  openGraph: {
    title: "Arunand's Aviation Academy",
    description:
      "Premium aviation academy in Bangalore for cabin crew, ground handling, airport operations, airline operations, hospitality, and logistics training.",
    url: "/",
  },
};

const offeredCourses = [
  "Cabin Crew",
  "Ground Handling",
  "Hospitality",
  "Airline Operations",
  "Airport Operations",
  "Air Cargo & Logistics",
];

const accreditationLogos = [
  {
    title: "NSDC",
    subtitle: "National Skill Development Corporation",
    image: "/images/nsdc-logo.png",
    width: 294,
    height: 266,
  },
  {
    title: "AASSC",
    subtitle: "Aerospace & Aviation Sector Skill Council",
    image: "/images/aassc-logo.png",
    width: 162,
    height: 164,
  },
  {
    title: "Skill India",
    subtitle: "Government Skill Initiative",
    image: "/images/skill-india-logo.png",
    width: 416,
    height: 114,
  },
];

const placementCompanyLogos: PlacementLogo[] = [
  {
    name: "Air India",
    image: "/images/placements/air-india-premium-logo.png",
    width: 460,
    height: 180,
  },
  {
    name: "AirAsia",
    image: "/images/placements/airasia-premium-logo.png",
    width: 360,
    height: 190,
  },
  {
    name: "Kempegowda International Airport Bengaluru",
    image: "/images/placements/blr-airport-premium-logo.png",
    width: 560,
    height: 190,
  },
  {
    name: "GlobeGround India",
    image: "/images/placements/globeground-india-premium-logo.png",
    width: 460,
    height: 180,
  },
  {
    name: "GoAir / Go First",
    image: "/images/placements/go-first-premium-logo.png",
    width: 380,
    height: 190,
  },
  {
    name: "SpiceJet",
    image: "/images/placements/spicejet-premium-logo.png",
    width: 420,
    height: 190,
  },
  {
    name: "Zero Eight Zero",
    image: "/images/placements/zero-eight-zero-placement-logo.png",
    width: 320,
    height: 210,
  },
  {
    name: "Vistara",
    image: "/images/placements/vistara-premium-logo.png",
    width: 360,
    height: 190,
  },
  {
    name: "Menzies Aviation",
    image: "/images/placements/menzies-aviation-premium-logo.png",
    width: 360,
    height: 190,
  },
  {
    name: "Plaza Premium Lounge",
    image: "/images/placements/plaza-premium-lounge-premium-logo.png",
    width: 420,
    height: 190,
  },
  {
    name: "HMS Host",
    image: "/images/placements/hms-host-premium-logo.png",
    width: 320,
    height: 210,
  },
];

const focusAreas = [
  "Cabin Crew",
  "Ground Handling",
  "Airport Operations",
  "Airline Operations",
  "Hospitality",
];

export default function HomePage() {
  return (
    <>
      <main className="home-canvas">
        <section className="observe-section home-hero relative overflow-hidden text-brand-dark">
          <div className="hero-orbit md:block" aria-hidden="true" />
          <div className="hero-cloud hero-cloud-one lg:block" aria-hidden="true" />
          <div className="hero-cloud hero-cloud-two lg:block" aria-hidden="true" />
          <Image
            src="/hero-plane-clouds.webp"
            alt="Airplane flying through a bright blue sky with clouds"
            fill
            priority
            quality={82}
            unoptimized
            className="object-cover object-center opacity-95"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(240,253,255,0.84),rgba(238,252,255,0.72),rgba(114,221,247,0.38))]" />
          <Container className="relative flex min-h-[calc(100vh-5rem)] flex-col justify-center gap-8 py-20">
            <div className="home-glass max-w-4xl p-6 sm:p-8 lg:p-10">
              <div className="hero-badge-row">
                <span className="admissions-pill">Admissions Open for 2026 Batch</span>
                <span className="hero-trust-tag">AASSC Affiliated Training Partner</span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                Aviation training academy
              </p>
              <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-normal sm:text-6xl lg:text-7xl">
                {siteContent.home.headline}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#16324F]/78">
                {siteContent.home.intro}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/enquiry"
                  prefetch={true}
                  className="premium-button rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  {siteContent.home.primaryCta}
                </Link>
                <Link
                  href="/courses"
                  prefetch={true}
                  className="premium-button rounded-full border border-[rgba(114,221,247,0.28)] bg-white/75 px-6 py-3 text-center text-sm font-semibold text-brand-dark transition hover:bg-white"
                >
                  {siteContent.home.secondaryCta}
                </Link>
              </div>
              <div className="hero-trust-strip">
                <div className="trust-chip">
                  <span className="trust-chip-kicker">Trust</span>
                  <strong>Placement-Oriented Training</strong>
                </div>
                <div className="trust-chip">
                  <span className="trust-chip-kicker">Industry</span>
                  <strong>Former Airline Professionals</strong>
                </div>
                <div className="trust-chip">
                  <span className="trust-chip-kicker">Support</span>
                  <strong>Grooming, Mock Interviews, Job Guidance</strong>
                </div>
              </div>
            </div>
            <div className="home-stat-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {siteContent.stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </Container>
        </section>

        <section className="observe-section home-about-section aviation-section py-20 sm:py-24">
          <Container className="home-panel grid gap-10 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="home-photo-contain home-photo-lift relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl p-3">
              <ImageWithFallback
                src="/images/optimized/home-group-photo.webp"
                fallbackSrc="/home-students.webp"
                alt="Arunand's Aviation Academy students and faculty group photo"
                width={1400}
                height={1002}
                loading="lazy"
                quality={82}
                unoptimized
                className="h-full w-full rounded-lg object-cover object-center"
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

        <section className="observe-section home-courses-section aviation-section py-20 sm:py-24">
          <Container className="home-panel grid gap-12 bg-white/70 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="home-color-strip mb-7 h-2 w-28 rounded-full" />
              <p className="text-lg font-semibold text-brand">Courses we offer</p>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                We Are The Best Aviation In Town
              </h2>
              <Link
                href="/courses"
                prefetch={true}
                className="premium-button mt-8 inline-flex rounded-2xl bg-brand px-7 py-4 text-sm font-semibold tracking-[0.2em] text-white transition hover:bg-brand-dark"
              >
                Explore Courses
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

        <section className="observe-section home-affiliation-section aviation-section py-20 sm:py-24">
          <Container className="grid gap-12">
            <div className="home-logo-band rounded-2xl p-5 sm:p-8">
              <div className="grid gap-4 rounded-xl bg-white p-5 text-center sm:grid-cols-3 sm:items-stretch sm:p-8">
                {accreditationLogos.map((item) => (
                  <article
                    key={item.title}
                    className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-[0_18px_40px_rgba(11,19,32,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(14,116,144,0.16)]"
                  >
                    <div className="flex h-28 w-full items-center justify-center">
                      <Image
                        src={item.image}
                        alt={`${item.title} logo`}
                        width={item.width}
                        height={item.height}
                        loading="lazy"
                        className="max-h-24 w-auto object-contain"
                        sizes="(min-width: 640px) 26vw, 80vw"
                      />
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-normal text-brand-dark">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted">
                      {item.subtitle}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="home-placement-strip overflow-hidden rounded-3xl border border-sky-100 bg-white/82 p-5 shadow-[0_18px_48px_rgba(11,19,32,0.08)] sm:p-6 lg:p-8">
              <div className="relative z-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  Placements
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                  Placements In Major Companies
                </h2>
              </div>
              <PlacementLogoMarquee logos={placementCompanyLogos} />
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr_0.85fr] lg:items-center">
              <div className="home-photo-lift relative min-h-72 overflow-hidden rounded-xl">
                <Image
                  src="/home-students.webp"
                  alt="Aviation students in professional training"
                  fill
                  loading="lazy"
                  quality={72}
                  unoptimized
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
                <div className="mt-8 grid gap-3">
                  {focusAreas.map((area) => (
                    <p
                      key={area}
                      className="rounded-2xl border border-sky-100 bg-white/80 px-5 py-3 text-2xl font-semibold leading-tight text-foreground shadow-sm"
                    >
                      {area}
                    </p>
                  ))}
                </div>
              </div>
              <div className="home-photo-lift relative min-h-72 overflow-hidden rounded-xl">
                <Image
                  src="/home-cabin-training.webp"
                  alt="Cabin crew training group"
                  fill
                  loading="lazy"
                  quality={72}
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, 100vw"
                />
              </div>
            </div>
          </Container>
        </section>

        <section className="observe-section home-services-section aviation-section py-20 sm:py-24">
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
    </>
  );
}
