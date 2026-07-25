"use client";

import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50" onClick={onSignOut}>
      Sign out
    </Button>
  );
}
