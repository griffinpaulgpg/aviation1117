/* eslint-disable @next/next/no-html-link-for-pages */

import type { Metadata } from "next";
import Link from "next/link";

import { ContactPanel } from "@/components/contact-panel";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Arunand's Aviation Academy in Bengaluru for aviation course enquiries, admissions guidance, and academy location details.",
  openGraph: {
    title: "Contact Arunand's Aviation Academy",
    description: "Reach the admissions team and find Arunand's Aviation Academy in Bengaluru.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <main className="site-sky public-page">
        <PageHero
          eyebrow="Contact"
          title="Talk to the admissions team."
          description="Use this page for academy contact details. Student enquiry form details are collected on a dedicated enquiry page."
        />
        <section className="motion-section observe-section aviation-section py-20">
          <Container className="grid gap-6">
            <div className="premium-card p-6 sm:p-8">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                    Enquiry Form
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
                    Submit student details on the enquiry page.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                    The enquiry page has a structured aviation institute form for student details,
                    address, contact, parent details, source, and references.
                  </p>
                </div>
                <Link
                  href="/enquiry"
                  prefetch={true}
                  className="premium-button rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  Open Enquiry Form
                </Link>
              </div>
            </div>
            <ContactPanel />
            <div className="premium-card p-4 sm:p-5">
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div className="p-2 sm:p-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                    Academy Map
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
                    Find us in Bengaluru.
                  </h2>
                  <p className="mt-4 text-base leading-7 text-muted">
                    {siteContent.contact.address}
                  </p>
                  <a
                    href={siteContent.contact.mapLink}
                    className="premium-button mt-6 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
                  >
                    Open in Google Maps
                  </a>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-inner shadow-sky-950/5">
                  <div className="absolute left-4 top-4 z-10 rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-sky-950/20">
                    Google Maps Location
                  </div>
                  <iframe
                    src={siteContent.contact.mapEmbedUrl}
                    title="Arunand's Aviation Academy location map"
                    className="h-80 w-full border-0 sm:h-96"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
