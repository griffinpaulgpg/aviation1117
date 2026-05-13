import { Footer } from "@/components/footer";
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
      <FloatingWhatsAppButton />
    </>
  );
}
