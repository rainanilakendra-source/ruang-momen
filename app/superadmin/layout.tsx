import type { ReactNode } from "react";
import { SuperAdminHeader } from "../_components/superadmin/superadmin-header";
import { SuperAdminSidebar } from "../_components/superadmin/superadmin-sidebar";
import { requireRole } from "../lib/auth";
import { ROLES } from "../lib/roles";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole(ROLES.SUPER_ADMIN);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071727] text-[#F5F0E7] lg:pl-[264px]">
      <SuperAdminSidebar />
      <div className="mx-auto min-h-screen w-full max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9 xl:px-12">
        <SuperAdminHeader userName={user.name} />
        {children}
      </div>
    </main>
  );
}
