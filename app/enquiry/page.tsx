import type { Metadata } from "next";

import { Container } from "@/components/container";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHero } from "@/components/page-hero";
import { getPublicCourses } from "@/lib/public-content-data";

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
  const courses = await getPublicCourses();

  return (
    <>
      <main className="site-sky">
        <PageHero
          eyebrow="Enquiry"
          title="Aviation institute enquiry form."
          description="Share student, contact, parent, source, and reference details so the admissions team can guide the right course path."
        />
        <section className="aviation-section py-20">
          <Container>
            <EnquiryForm
              initialCourse={selectedCourse}
              courses={courses.map((course) => course.title)}
            />
          </Container>
        </section>
      </main>
    </>
  );
}
