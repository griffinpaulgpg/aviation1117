type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="reveal-on-scroll max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-lg leading-8 text-muted">{description}</p> : null}
    </div>
  );
}
