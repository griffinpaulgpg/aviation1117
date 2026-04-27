import Link from "next/link";

import { Container } from "@/components/container";
import { siteContent } from "@/lib/site-content";

const navItems = [
  { label: "Courses", href: "/courses" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-brand-dark/95 text-white backdrop-blur">
      <Container className="flex min-h-20 items-center justify-between gap-6 py-4">
        <Link href="/" className="max-w-56 text-lg font-semibold leading-tight">
          {siteContent.meta.name}
        </Link>
        <nav className="text-white/82 hidden items-center gap-5 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/admin"
          className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-accent"
        >
          Admin Login
        </Link>
      </Container>
    </header>
  );
}
