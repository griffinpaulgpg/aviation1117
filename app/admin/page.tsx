import Link from "next/link";

import { Container } from "@/components/container";
import { SiteFrame } from "@/components/site-frame";

export default function AdminLoginPage() {
  return (
    <SiteFrame>
      <main className="bg-white py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              Admin Portal
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
              Manage the website from one creative dashboard.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              Add photos, review enquiries, publish testimonials, update events, and manage courses
              from a polished admin experience.
            </p>
          </div>
          <form className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Admin Login</h2>
            <div className="mt-6 grid gap-4">
              <input
                className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-brand"
                placeholder="Admin email"
                type="email"
              />
              <input
                className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-brand"
                placeholder="Password"
                type="password"
              />
              <Link
                href="/admin/dashboard"
                className="rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Open Dashboard
              </Link>
            </div>
          </form>
        </Container>
      </main>
    </SiteFrame>
  );
}
