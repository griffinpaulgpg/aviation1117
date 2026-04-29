import Link from "next/link";

import { ContactPanel } from "@/components/contact-panel";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";

export default function ContactPage() {
  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Contact"
          title="Talk to the admissions team."
          description="Use this page for academy contact details. Student enquiry form details are collected on a dedicated enquiry page."
        />
        <section className="py-20">
          <Container className="grid gap-6">
            <div className="surface-card p-6 sm:p-8">
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
                  className="rounded-full bg-brand-dark px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand"
                >
                  Open Enquiry Form
                </Link>
              </div>
            </div>
            <ContactPanel />
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
