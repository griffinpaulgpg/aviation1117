import { redirect } from "next/navigation";

import { AdminConsole } from "@/components/admin-console";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { SiteFrame } from "@/components/site-frame";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { getEmptyAdminDashboardData } from "@/lib/admin-dashboard-empty";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminSignedIn())) {
    redirect("/admin");
  }

  return (
    <SiteFrame>
      <main className="site-sky">
        <PageHero
          eyebrow="Admin Dashboard"
          title="Website control center."
          description="Manage courses, events, gallery folders, testimonials, enquiries, and faculty accounts in the same Arunand's Aviation Academy design system."
        />
        <section className="aviation-section py-14 sm:py-20">
          <Container>
            <AdminConsole initialData={getEmptyAdminDashboardData()} />
          </Container>
        </section>
      </main>
    </SiteFrame>
  );
}
