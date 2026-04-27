import { ChatBox } from "@/components/chat-box";
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
          description="Use the enquiry box, email, phone number, or academy address to get course and batch information."
        />
        <section className="py-20">
          <Container className="grid gap-6">
            <ChatBox />
            <ContactPanel />
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
