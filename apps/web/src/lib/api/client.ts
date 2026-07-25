import type { CreateTicketIntakeInput, UpdateOrganizationSettingsInput } from "@gft-assist/types";

import { getApiUrl, parseError } from "./shared";

export async function createTicketIntake(input: CreateTicketIntakeInput) {
  const response = await fetch(getApiUrl("/tickets/intake"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function uploadKnowledgeDocument(file: File, accessToken: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(getApiUrl("/knowledge-documents/upload"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function runTicketTriage(ticketId: string, accessToken: string) {
  const response = await fetch(getApiUrl(`/ai/tickets/${ticketId}/triage`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function runGroundedResponse(ticketId: string, accessToken: string) {
  const response = await fetch(getApiUrl(`/ai/tickets/${ticketId}/respond`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateOrganizationSettings(input: UpdateOrganizationSettingsInput, accessToken: string) {
  const response = await fetch(getApiUrl("/settings"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
