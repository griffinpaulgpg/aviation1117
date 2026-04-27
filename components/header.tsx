import Link from "next/link";

import { Container } from "@/components/container";
import { siteContent } from "@/lib/site-content";

const navItems = [
  { label: "Courses", href: "#courses" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-brand-dark/95 text-white backdrop-blur">
      <div className="bg-accent px-4 py-2 text-center text-xs font-semibold uppercase tracking-normal text-brand-dark">
        {siteContent.home.announcement}
      </div>
      <Container className="flex min-h-20 items-center justify-between gap-6 py-4">
        <Link href="/" className="max-w-56 text-lg font-semibold leading-tight">
          {siteContent.meta.name}
        </Link>
        <nav className="text-white/82 hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href={`tel:${siteContent.contact.phone.replaceAll(" ", "")}`}
          className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-accent"
        >
          Call Now
        </Link>
      </Container>
    </header>
  );
}
