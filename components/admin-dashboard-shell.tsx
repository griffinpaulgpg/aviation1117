"use client";

import type { AdminSession } from "@/lib/admin-auth";
import type { AdminDashboardData } from "@/lib/content-data";
import { AdminConsole } from "@/components/admin-console";

type AdminDashboardShellProps = {
  initialData: AdminDashboardData;
  currentSession: AdminSession;
};

export function AdminDashboardShell({
  initialData,
  currentSession,
}: AdminDashboardShellProps) {
  return <AdminConsole initialData={initialData} currentSession={currentSession} />;
}
