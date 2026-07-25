import type {
  AiRunListResponse,
  DashboardSummaryResponse,
  KnowledgeDocumentDetailResponse,
  KnowledgeDocumentListResponse,
  OrganizationSettingsResponse,
  TicketDetailResponse,
  TicketListResponse,
} from "@gft-assist/types";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

import { getApiUrl, parseError } from "./shared";

export async function getServerAccessToken() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function fetchTickets(accessToken: string) {
  const response = await fetch(getApiUrl("/tickets"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as TicketListResponse;
}

export async function fetchTicket(ticketId: string, accessToken: string) {
  const response = await fetch(getApiUrl(`/tickets/${ticketId}`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as TicketDetailResponse;
}

export async function fetchKnowledgeDocuments(accessToken: string) {
  const response = await fetch(getApiUrl("/knowledge-documents"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as KnowledgeDocumentListResponse;
}

export async function fetchKnowledgeDocument(documentId: string, accessToken: string) {
  const response = await fetch(getApiUrl(`/knowledge-documents/${documentId}`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as KnowledgeDocumentDetailResponse;
}

export async function fetchDashboardSummary(accessToken: string) {
  const response = await fetch(getApiUrl("/dashboard/summary"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as DashboardSummaryResponse;
}

export async function fetchAiRuns(accessToken: string) {
  const response = await fetch(getApiUrl("/ai-runs"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AiRunListResponse;
}

export async function fetchOrganizationSettings(accessToken: string) {
  const response = await fetch(getApiUrl("/settings"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as OrganizationSettingsResponse;
}
