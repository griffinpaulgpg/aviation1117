import Link from "next/link";

import { siteContent } from "@/lib/site-content";

export function ChatBox() {
  return (
    <section className="rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            Admissions Chat
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
            Have a question? Send the team a quick enquiry.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            This is the front-end chat/enquiry box. It can be connected to WhatsApp, email, or a
            database-backed admin inbox in the next step.
          </p>
        </div>
        <form className="grid gap-4">
          <input
            className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="Your name"
            type="text"
          />
          <input
            className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="Phone or email"
            type="text"
          />
          <textarea
            className="min-h-28 rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="Course, batch, or admission question"
          />
          <Link
            href={`mailto:${siteContent.contact.email}`}
            className="rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Send Enquiry
          </Link>
        </form>
      </div>
    </section>
  );
}
