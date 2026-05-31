import { Container } from "@/components/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="observe-section page-hero py-20 text-brand-dark sm:py-24">
      <div className="hero-orbit md:block" aria-hidden="true" />
      <div className="hero-cloud hero-cloud-one lg:block" aria-hidden="true" />
      <div className="hero-cloud hero-cloud-two lg:block" aria-hidden="true" />
      <Container className="relative">
        <div className="page-hero-panel max-w-4xl rounded-[2rem] border border-[rgba(114,221,247,0.25)] bg-[rgba(255,255,255,0.55)] p-6 shadow-[0_10px_30px_rgba(114,221,247,0.12)] backdrop-blur-[12px] sm:p-8 lg:p-10">
          <p className="reveal-on-scroll text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            {eyebrow}
          </p>
          <h1 className="reveal-on-scroll mt-4 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
            {title}
          </h1>
          <p className="reveal-on-scroll mt-6 max-w-2xl text-lg leading-8 text-[#16324F]/80">
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}
