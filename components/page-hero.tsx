import { Container } from "@/components/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero py-20 text-white">
      <Container className="relative z-10">
        <div className="bg-white/8 absolute right-8 top-0 hidden h-44 w-44 rotate-12 rounded-3xl border border-white/15 shadow-2xl shadow-black/20 md:block" />
        <div className="bg-accent/18 absolute right-28 top-20 hidden h-28 w-28 -rotate-12 rounded-3xl border border-accent/40 md:block" />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
          {title}
        </h1>
        <p className="text-white/76 mt-6 max-w-2xl text-lg leading-8">{description}</p>
      </Container>
    </section>
  );
}
