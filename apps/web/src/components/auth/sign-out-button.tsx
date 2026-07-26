"use client";

import type { ComponentProps } from "react";

import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = Omit<ComponentProps<typeof Button>, "children" | "onClick">;

export function SignOutButton(props: SignOutButtonProps) {
  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button onClick={onSignOut} {...props}>
      Sign out
    </Button>
  );
}
