import { Container } from "@/components/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="observe-section page-hero py-20 text-white sm:py-24">
      <div className="hero-orbit md:block" aria-hidden="true" />
      <div className="hero-cloud hero-cloud-one lg:block" aria-hidden="true" />
      <div className="hero-cloud hero-cloud-two lg:block" aria-hidden="true" />
      <Container className="relative">
        <div className="page-hero-panel max-w-4xl rounded-[2rem] border border-white/16 bg-white/10 p-6 shadow-[0_24px_60px_rgba(11,19,32,0.18)] backdrop-blur-xl sm:p-8 lg:p-10">
          <p className="reveal-on-scroll text-sm font-semibold uppercase tracking-[0.16em] text-sky-200">
            {eyebrow}
          </p>
          <h1 className="reveal-on-scroll mt-4 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
            {title}
          </h1>
          <p className="reveal-on-scroll text-white/78 mt-6 max-w-2xl text-lg leading-8">
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}
