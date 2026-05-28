import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { Container } from "@/components/container";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure admin login for Arunand's Aviation Academy website management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="site-sky min-h-screen py-20">
      <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="observe-section">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Admin Portal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            Manage the website from one creative dashboard.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            Sign in securely to review enquiries, update courses and events, publish gallery
            media, and manage the aviation academy website in one place.
          </p>
        </div>
        <div className="observe-section">
          <AdminLoginForm />
        </div>
      </Container>
    </main>
  );
}
