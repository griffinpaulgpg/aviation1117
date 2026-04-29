import Link from "next/link";

import { Container } from "@/components/container";
import { siteContent } from "@/lib/site-content";

const footerLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Enquiry", href: "/enquiry" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-brand-dark py-12 text-white">
      <Container className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-xl font-semibold">{siteContent.meta.name}</p>
          <p className="text-white/72 mt-4 max-w-xl text-sm leading-6">
            Aviation training, airport exposure, grooming, and placement preparation in a clean
            multipage website.
          </p>
        </div>
        <div>
          <p className="font-semibold">Quick Links</p>
          <div className="text-white/72 mt-4 flex flex-wrap gap-3 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
      <Container className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
        © Arunand&apos;s Aviation Academy. All rights reserved.
      </Container>
    </footer>
  );
}
