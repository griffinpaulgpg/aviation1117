import Link from "next/link";

import { Container } from "@/components/container";
import { siteContent } from "@/lib/site-content";

export function Footer() {
  return (
    <footer className="bg-brand-dark py-12 text-white">
      <Container className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold">{siteContent.meta.name}</p>
          <p className="text-white/72 mt-4 max-w-xl text-sm leading-6">
            {siteContent.contact.address}
          </p>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <div className="text-white/72 mt-4 space-y-2 text-sm">
            <p>{siteContent.contact.email}</p>
            <p>{siteContent.contact.phone}</p>
          </div>
        </div>
        <div>
          <p className="font-semibold">Quick Links</p>
          <div className="text-white/72 mt-4 grid gap-2 text-sm">
            <Link href="#courses" className="hover:text-white">
              Courses
            </Link>
            <Link href="#about" className="hover:text-white">
              About
            </Link>
            <Link href="#contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </Container>
      <Container className="mt-10 border-t border-white/10 pt-6 text-sm text-white/60">
        © Arunand&apos;s Aviation Academy. All rights reserved.
      </Container>
    </footer>
  );
}
