import Link from "next/link";

import { Container } from "@/components/container";
import { siteContent } from "@/lib/site-content";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Enquiry", href: "/enquiry" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-brand-dark/95 text-white backdrop-blur">
      <Container className="flex min-h-20 items-center justify-between gap-3 py-4 sm:gap-4">
        <Link
          href="/"
          className="max-w-40 text-base font-semibold leading-tight sm:max-w-56 sm:text-lg"
        >
          {siteContent.meta.name}
        </Link>
        <nav
          aria-label="Primary"
          className="text-white/82 mx-auto hidden min-w-0 flex-1 gap-2 overflow-x-auto px-2 text-sm font-semibold md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-white/12 shrink-0 rounded-full border px-4 py-2 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/admin"
          className="shrink-0 rounded-full bg-white px-3 py-2.5 text-xs font-semibold text-brand-dark transition hover:bg-accent sm:px-5 sm:py-3 sm:text-sm"
        >
          Admin Login
        </Link>
      </Container>
      <div className="bg-white/8 border-t border-white/10 md:hidden">
        <Container>
          <nav
            aria-label="Primary mobile"
            className="text-white/82 flex gap-2 overflow-x-auto py-3 text-sm font-semibold"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-white/12 shrink-0 rounded-full border px-4 py-2 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
