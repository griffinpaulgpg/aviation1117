import { Footer } from "@/components/footer";
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
    </>
  );
}
