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
    <header className="site-header sticky top-0 z-50">
      <Container className="flex min-h-20 items-center justify-between gap-3 py-4 sm:gap-4">
        <Link
          href="/"
          className="max-w-40 text-base font-semibold leading-tight text-brand-dark sm:max-w-56 sm:text-lg"
        >
          {siteContent.meta.name}
        </Link>
        <nav
          aria-label="Primary"
          className="mx-auto hidden min-w-0 flex-1 gap-2 overflow-x-auto px-2 text-sm font-semibold md:flex"
        >
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav-link shrink-0 px-4 py-2">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/admin"
          className="site-admin-link shrink-0 rounded-full px-3 py-2.5 text-xs font-semibold transition sm:px-5 sm:py-3 sm:text-sm"
        >
          Admin Login
        </Link>
      </Container>
      <div className="border-t border-border/60 bg-white/70 md:hidden">
        <Container>
          <nav
            aria-label="Primary mobile"
            className="flex gap-2 overflow-x-auto py-3 text-sm font-semibold"
          >
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="site-nav-link shrink-0 px-4 py-2">
                {item.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
