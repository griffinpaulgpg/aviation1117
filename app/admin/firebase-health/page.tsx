import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminFirebaseHealth } from "@/components/admin-firebase-health";
import { Container } from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Firebase Health",
  description: "Firebase health and connectivity checks for Arunand's Aviation Academy admin.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminFirebaseHealthPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="site-sky">
      <PageHero
        eyebrow="Admin Firebase Health"
        title="Firebase diagnostics and setup status."
        description="Check app initialization, Firestore, Authentication, and the collections the website uses. Storage is disabled because media files use Hostinger/local public storage."
      />
      <section className="aviation-section py-14 sm:py-20">
        <Container>
          <AdminFirebaseHealth />
        </Container>
      </section>
    </main>
  );
}
