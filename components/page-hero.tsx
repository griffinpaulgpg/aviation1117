import { Container } from "@/components/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden px-3 pb-12 pt-6 text-white sm:pb-16">
      <Container className="hero-shell relative overflow-hidden px-6 py-16 sm:px-10 sm:py-20">
        <div className="sky-orbit right-8 top-8 hidden md:block" />
        <div className="sky-orbit small right-36 top-32 hidden md:block" />
        <div className="relative max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">{title}</h1>
          <p className="text-white/76 mt-6 max-w-2xl text-lg leading-8">{description}</p>
        </div>
      </Container>
    </section>
  );
}
