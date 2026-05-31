import { SocialLink } from "@/components/social-link";
import { siteContent } from "@/lib/site-content";

export function ContactPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[rgba(114,221,247,0.25)] bg-[linear-gradient(135deg,#F0FDFF,#EEFCFF,#F7FBFF)] p-6 text-brand-dark shadow-[0_10px_30px_rgba(114,221,247,0.12)] sm:p-8">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(114,221,247,0.20),transparent_16rem),linear-gradient(135deg,rgba(255,255,255,0.34),transparent_42%)]"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Reach Us</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal">
          Start the conversation today.
        </h2>
        <div className="mt-6 grid gap-5 text-sm leading-6 text-[#16324F]/76 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-brand-dark">Email</p>
            <a href={`mailto:${siteContent.contact.email}`} className="hover:text-accent">
              {siteContent.contact.email}
            </a>
          </div>
          <div>
            <p className="font-semibold text-brand-dark">Mobile</p>
            <a
              href={`tel:${siteContent.contact.phone.replaceAll(" ", "")}`}
              className="hover:text-accent"
            >
              {siteContent.contact.phone}
            </a>
          </div>
          <div className="sm:col-span-2">
            <p className="font-semibold text-brand-dark">Academy Location</p>
            <p>{siteContent.contact.address}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="font-semibold text-brand-dark">Batch Timing</p>
            <p>{siteContent.contact.batchTimings.join(" / ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="font-semibold text-brand-dark">Social Media</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {siteContent.contact.socialLinks.map((link) => (
                <SocialLink key={link.href} href={link.href} label={link.label} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
