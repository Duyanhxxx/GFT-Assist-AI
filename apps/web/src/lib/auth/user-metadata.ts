import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@gft-assist/types";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

export function resolveUserRole(user: User): AppRole {
  const appMetadata = asRecord(user.app_metadata);
  const userMetadata = asRecord(user.user_metadata);
  const roleCandidate = appMetadata.platform_role ?? userMetadata.platform_role ?? user.role;

  return roleCandidate === "ADMIN" || roleCandidate === "OPERATOR" || roleCandidate === "VIEWER"
    ? roleCandidate
    : "VIEWER";
}

export function resolveOrganizationId(user: User) {
  const appMetadata = asRecord(user.app_metadata);
  const userMetadata = asRecord(user.user_metadata);
  const organizationId =
    appMetadata.organization_id ??
    userMetadata.organization_id ??
    appMetadata.organizationId ??
    userMetadata.organizationId ??
    appMetadata.org_id ??
    userMetadata.org_id;

  return typeof organizationId === "string" ? organizationId : undefined;
}
