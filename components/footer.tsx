/* eslint-disable @next/next/no-html-link-for-pages */

import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/container";
import { SocialLink } from "@/components/social-link";
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
    <footer className="relative overflow-hidden bg-brand-dark py-14 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(56,189,248,0.24),transparent_18rem),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-16 top-10 h-44 w-44 rounded-full border border-white/10 bg-white/5"
        aria-hidden="true"
      />
      <Container className="relative grid gap-8 md:grid-cols-[1.3fr_1fr]">
        <div className="footer-glass p-6">
          <Link
            href="/"
            prefetch={true}
            aria-label={siteContent.meta.name}
            className="inline-flex rounded-3xl transition duration-200 hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-sky-200/40"
          >
            <Image
              src="/images/company-logo.png"
              alt={siteContent.meta.name}
              width={180}
              height={180}
              loading="lazy"
              className="h-32 w-32 rounded-3xl object-contain shadow-lg shadow-sky-950/20 sm:h-40 sm:w-40"
            />
          </Link>
          <div className="text-white/72 mt-4 max-w-xl space-y-4 text-sm leading-6">
            <p>
              Arunand&apos;s Aviation Academy is a Bangalore-based aviation training academy
              offering aviation and air cargo certificate courses. The academy is an affiliated
              training partner with the Aerospace &amp; Aviation Sector Skill Council (AASSC) and is
              led by former airline professionals with 15+ years of experience across airline
              operations, cargo, catering, safety, security, vigilance, and airport operations.
            </p>
            <p>
              We focus on practical training, grooming, communication skills, interview preparation,
              and placement-oriented learning. Our goal is to prepare students for real aviation
              careers by building confidence, discipline, industry knowledge, and professional
              presentation.
            </p>
            <p>
              <span className="font-semibold text-white">Address:</span>{" "}
              {siteContent.contact.address}
            </p>
          </div>
        </div>
        <div className="footer-glass p-6">
          <p className="font-semibold">Quick Links</p>
          <div className="text-white/72 mt-4 flex flex-wrap gap-3 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className="rounded-full border border-white/10 px-3 py-2 transition hover:border-sky-200/50 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-6 font-semibold">Follow Us</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {siteContent.contact.socialLinks.map((link) => (
              <SocialLink key={link.href} href={link.href} label={link.label} variant="light" />
            ))}
          </div>
        </div>
      </Container>
      <Container className="relative mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
        © Arunand&apos;s Aviation Academy. All rights reserved.
      </Container>
    </footer>
  );
}
