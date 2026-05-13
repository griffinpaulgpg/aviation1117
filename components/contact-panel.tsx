import { SocialLink } from "@/components/social-link";
import { siteContent } from "@/lib/site-content";

export function ContactPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-dark p-6 text-white shadow-[0_28px_90px_rgb(14_116_144_/_0.20)] sm:p-8">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(56,189,248,0.28),transparent_16rem),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_42%)]"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-200">Reach Us</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal">
          Start the conversation today.
        </h2>
        <div className="text-white/76 mt-6 grid gap-5 text-sm leading-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-white">Email</p>
            <a href={`mailto:${siteContent.contact.email}`} className="hover:text-accent">
              {siteContent.contact.email}
            </a>
          </div>
          <div>
            <p className="font-semibold text-white">Mobile</p>
            <a
              href={`tel:${siteContent.contact.phone.replaceAll(" ", "")}`}
              className="hover:text-accent"
            >
              {siteContent.contact.phone}
            </a>
          </div>
          <div className="sm:col-span-2">
            <p className="font-semibold text-white">Academy Location</p>
            <p>{siteContent.contact.address}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="font-semibold text-white">Batch Timing</p>
            <p>{siteContent.contact.batchTimings.join(" / ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="font-semibold text-white">Social Media</p>
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
