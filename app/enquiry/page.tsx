import type { Metadata } from "next";

import { Container } from "@/components/container";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHero } from "@/components/page-hero";
import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Enquiry",
  description:
    "Submit an aviation institute enquiry form for course guidance, admissions support, and career training information.",
  openGraph: {
    title: "Aviation Course Enquiry",
    description:
      "Send your details to Arunand's Aviation Academy for course and admissions guidance.",
    url: "/enquiry",
  },
};

type EnquiryPageProps = {
  searchParams?: Promise<{
    course?: string | string[];
  }>;
};

export default async function EnquiryPage({ searchParams }: EnquiryPageProps) {
  const params = await searchParams;
  const selectedCourse = Array.isArray(params?.course) ? params.course[0] : params?.course;
  const courses = siteContent.courses.map((course) => course.title);
  const enquirySources = [
    "Newspaper Ads",
    "Pamphlet",
    "Hoardings",
    "Seminar",
    "JustDial",
    "Friends & Relatives",
    "Other",
  ];

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Enquiry"
          title="Aviation institute enquiry form."
          description="Share student, contact, parent, source, and reference details so the admissions team can guide the right course path."
        />
        <section className="observe-section aviation-section py-20">
          <Container>
            <div className="mb-6 rounded-3xl border border-sky-100 bg-white/80 p-5 text-sm leading-6 text-muted shadow-[0_18px_50px_rgba(11,19,32,0.08)]">
              <p className="font-semibold text-brand-dark">Academy Address</p>
              <p className="mt-2">{siteContent.contact.address}</p>
            </div>
            <EnquiryForm
              initialCourse={selectedCourse}
              courses={courses}
              enquirySources={enquirySources}
            />
          </Container>
        </section>
      </main>
    </>
  );
}
