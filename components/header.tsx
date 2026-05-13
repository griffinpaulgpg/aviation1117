"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import { cn } from "@/lib/cn";
import { siteContent } from "@/lib/site-content";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Enquiry", href: "/enquiry" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/35 bg-white/95 text-brand-dark shadow-[0_10px_28px_rgb(14_116_144_/_0.08)]">
      <Container className="flex min-h-20 items-center justify-between gap-3 py-4 sm:gap-4">
        <Link
          href="/"
          prefetch={false}
          className="max-w-40 text-base font-semibold leading-tight tracking-normal text-brand-dark sm:max-w-56 sm:text-lg"
        >
          {siteContent.meta.name}
        </Link>
        <nav
          aria-label="Primary"
          className="mx-auto hidden min-w-0 flex-1 gap-2 overflow-x-auto px-2 text-sm font-semibold text-muted md:flex"
        >
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 transition duration-200 hover:border-sky-200 hover:bg-sky-50 hover:text-brand-dark",
                  active
                    ? "border-sky-200 bg-sky-100 text-brand-dark shadow-sm"
                    : "bg-white/48 border-slate-200/80",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/admin"
          prefetch={false}
          className="premium-button shrink-0 rounded-full bg-brand-dark px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-brand sm:px-5 sm:py-3 sm:text-sm"
        >
          Admin Login
        </Link>
      </Container>
      <div className="bg-white/58 border-t border-sky-100/80 md:hidden">
        <Container>
          <nav
            aria-label="Primary mobile"
            className="flex gap-2 overflow-x-auto py-3 text-sm font-semibold text-muted"
          >
            {navItems.map((item) => {
              const active =
                item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 transition hover:border-sky-200 hover:bg-sky-50 hover:text-brand-dark",
                    active
                      ? "border-sky-200 bg-sky-100 text-brand-dark"
                      : "bg-white/56 border-slate-200/80",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </div>
    </header>
  );
}
