import { Container } from "@/components/container";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";

type EnquiryPageProps = {
  searchParams?: Promise<{
    course?: string | string[];
  }>;
};

export default async function EnquiryPage({ searchParams }: EnquiryPageProps) {
  const params = await searchParams;
  const selectedCourse = Array.isArray(params?.course) ? params.course[0] : params?.course;

  return (
    <SiteFrame>
      <main>
        <PageHero
          eyebrow="Enquiry"
          title="Aviation institute enquiry form."
          description="Share student, contact, parent, source, and reference details so the admissions team can guide the right course path."
        />
        <section className="py-20">
          <Container>
            <EnquiryForm initialCourse={selectedCourse} />
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
