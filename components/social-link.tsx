type SocialLinkProps = {
  href: string;
  label: string;
  variant?: "dark" | "light";
};

function SocialIcon({ label }: { label: string }) {
  if (label === "Instagram") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand shadow-lg shadow-sky-950/20">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 fill-none stroke-white stroke-[2.2]"
        >
          <rect x="5" y="5" width="14" height="14" rx="4" />
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="16.7" cy="7.3" r="0.8" className="fill-white stroke-none" />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark shadow-lg shadow-sky-950/20">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-white">
        <path d="M10 8.5v7l6-3.5-6-3.5Z" />
      </svg>
    </span>
  );
}

export function SocialLink({ href, label, variant = "dark" }: SocialLinkProps) {
  const textClass = variant === "light" ? "text-white/76 hover:text-white" : "text-white";

  return (
    <a
      href={href}
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-2 pl-2 pr-4 text-sm font-semibold ${textClass} transition hover:border-sky-200/60 hover:bg-white/15`}
    >
      <SocialIcon label={label} />
      <span>{label}</span>
    </a>
  );
}
