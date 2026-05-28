import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboardShell } from "@/components/admin-dashboard-shell";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { getAdminSession } from "@/lib/admin-auth";
import { getEmptyAdminDashboardData } from "@/lib/admin-dashboard-empty";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Protected dashboard for Arunand's Aviation Academy website management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <main className="site-sky min-h-screen">
        <PageHero
          eyebrow="Admin Dashboard"
          title="Website control center."
          description="Manage courses, events, gallery folders, testimonials, enquiries, and faculty accounts in the same Arunand's Aviation Academy design system."
        />
        <section className="aviation-section py-14 sm:py-20">
          <Container>
            <AdminDashboardShell
              initialData={getEmptyAdminDashboardData()}
              currentSession={session}
            />
          </Container>
        </section>
      </main>
    </>
  );
}
