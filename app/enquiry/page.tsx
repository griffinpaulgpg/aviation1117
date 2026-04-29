import { Container } from "@/components/container";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";

export default function EnquiryPage() {
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
            <EnquiryForm />
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
