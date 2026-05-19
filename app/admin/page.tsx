import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin-login-form";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure admin login for Arunand's Aviation Academy website management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <>
      <main className="site-sky py-20">
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
          <AdminLoginForm />
        </Container>
      </main>
    </>
  );
}
