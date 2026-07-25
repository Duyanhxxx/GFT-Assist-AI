import type { AppRole } from "@gft-assist/types";

export type RequestUser = {
  id: string;
  email: string;
  role: AppRole;
  organizationId?: string;
};
