import { env } from "@/lib/env";

type ApiErrorShape = {
  message?: string | string[];
  error?: {
    message?: string;
  };
};

export async function parseError(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiErrorShape | null;

  if (typeof body?.error?.message === "string") {
    return body.error.message;
  }

  if (typeof body?.message === "string") {
    return body.message;
  }

  if (Array.isArray(body?.message) && typeof body.message[0] === "string") {
    return body.message[0];
  }

  return `Request failed with status ${response.status}.`;
}

export function getApiUrl(path: string) {
  return `${env.apiUrl}${path}`;
}
