type SocialLinkProps = {
  href: string;
  label: string;
  variant?: "dark" | "light";
};

function SocialIcon({ label }: { label: string }) {
  if (label === "Instagram") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_110%,#feda75_0%,#fa7e1e_25%,#d62976_52%,#962fbf_75%,#4f5bd5_100%)] shadow-lg shadow-pink-950/20">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 fill-none stroke-white stroke-[2]"
        >
          <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="4.4" />
          <circle cx="12" cy="12" r="3.45" />
          <circle cx="16.75" cy="7.25" r="1" className="fill-white stroke-none" />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF0000] shadow-lg shadow-red-950/20">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-white">
        <path d="M21.58 7.19a2.72 2.72 0 0 0-1.91-1.93C17.98 4.8 11.2 4.8 11.2 4.8s-6.78 0-8.47.46A2.72 2.72 0 0 0 .82 7.19 28.25 28.25 0 0 0 .36 12a28.25 28.25 0 0 0 .46 4.81 2.72 2.72 0 0 0 1.91 1.93c1.69.46 8.47.46 8.47.46s6.78 0 8.47-.46a2.72 2.72 0 0 0 1.91-1.93A28.25 28.25 0 0 0 22.04 12a28.25 28.25 0 0 0-.46-4.81ZM9.04 15.2V8.8L14.67 12l-5.63 3.2Z" />
      </svg>
    </span>
  );
}

export function SocialLink({ href, label, variant = "dark" }: SocialLinkProps) {
  const textClass =
    variant === "light" ? "text-white/76 hover:text-white" : "text-brand-dark hover:text-brand-dark";
  const chromeClass =
    variant === "light"
      ? "border-white/15 bg-white/10 hover:border-sky-200/60 hover:bg-white/15"
      : "border-[rgba(114,221,247,0.25)] bg-white/55 hover:border-[rgba(114,221,247,0.45)] hover:bg-white/75";

  return (
    <a
      href={href}
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border py-2 pl-2 pr-4 text-sm font-semibold ${textClass} ${chromeClass} transition`}
    >
      <SocialIcon label={label} />
      <span>{label}</span>
    </a>
  );
}
