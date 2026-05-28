import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminRouteGatePage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  redirect("/admin/dashboard");
}
