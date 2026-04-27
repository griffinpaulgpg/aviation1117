import Link from "next/link";

import { siteContent } from "@/lib/site-content";

export function ContactPanel() {
  return (
    <div className="hero-shell p-6 text-white sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Reach Us</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-normal">Start the conversation today.</h2>
      <div className="text-white/76 mt-6 grid gap-5 text-sm leading-6 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-white">Email</p>
          <Link href={`mailto:${siteContent.contact.email}`} className="hover:text-accent">
            {siteContent.contact.email}
          </Link>
        </div>
        <div>
          <p className="font-semibold text-white">Mobile</p>
          <Link
            href={`tel:${siteContent.contact.phone.replaceAll(" ", "")}`}
            className="hover:text-accent"
          >
            {siteContent.contact.phone}
          </Link>
        </div>
        <div className="sm:col-span-2">
          <p className="font-semibold text-white">Academy Location</p>
          <p>{siteContent.contact.address}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="font-semibold text-white">Batch Timing</p>
          <p>{siteContent.contact.batchTimings.join(" / ")}</p>
        </div>
      </div>
    </div>
  );
}
