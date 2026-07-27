import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { resolveOrganizationId, resolveUserRole } from "@/lib/auth/user-metadata";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  if (!hasSupabaseEnv()) {
    return children;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = resolveUserRole(user);
  const organizationId = resolveOrganizationId(user);

  return (
    <AppShell
      user={{
        email: user.email ?? "Unknown user",
        role,
        ...(organizationId ? { organizationId } : {}),
      }}
    >
      {children}
    </AppShell>
  );
}
