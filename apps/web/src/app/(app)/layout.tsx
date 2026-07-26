import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import type { AppRole } from "@gft-assist/types";

import { AppShell } from "@/components/layout/app-shell";
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

  const roleValue = user.app_metadata?.platform_role;
  const role: AppRole = roleValue === "ADMIN" || roleValue === "OPERATOR" || roleValue === "VIEWER" ? roleValue : "VIEWER";
  const organizationId = user.app_metadata?.organization_id as string | undefined;

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
