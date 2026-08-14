import type { ReactNode } from "react";
import { requireDashboardUser } from "@/lib/admin";
import { AdminSidebar } from "../_components/sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardUser();

  return (
    <div className="flex min-h-screen bg-fd-background text-fd-foreground">
      <AdminSidebar user={user} scope={user.scope} />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="w-full min-w-0 max-w-screen-2xl space-y-6 p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
