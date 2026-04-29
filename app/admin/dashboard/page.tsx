import Link from "next/link";

import { AdminConsole } from "@/components/admin-console";
import { Container } from "@/components/container";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <header className="border-b border-white/10 bg-white/5 text-white backdrop-blur">
        <Container className="flex min-h-20 items-center justify-between gap-6 py-4">
          <div>
            <p className="text-sm text-white/60">Arunand&apos;s Aviation Academy</p>
            <h1 className="text-2xl font-semibold">Creative Admin Dashboard</h1>
          </div>
          <Link
            href="/"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-accent"
          >
            View Website
          </Link>
        </Container>
      </header>
      <section className="py-10">
        <Container>
          <div className="border-white/14 mb-8 rounded-2xl border bg-white/10 p-6 text-white shadow-2xl shadow-black/10 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              Website Control Center
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal">
              Manage content with a layered dashboard built for fast updates.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              This front-end dashboard shows the future admin workflow. The next step is connecting
              it to authentication, storage, and a database.
            </p>
          </div>
          <AdminConsole />
        </Container>
      </section>
    </main>
  );
}
