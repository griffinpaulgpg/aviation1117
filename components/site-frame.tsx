import { Footer } from "@/components/footer";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp-button";
import { Header } from "@/components/header";

type SiteFrameProps = Readonly<{
  children: React.ReactNode;
}>;

export function SiteFrame({ children }: SiteFrameProps) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <FloatingChatbot />
      <FloatingWhatsAppButton />
    </>
  );
}
