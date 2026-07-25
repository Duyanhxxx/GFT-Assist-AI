import { env } from "@/lib/env";

type ApiErrorShape = {
  error?: {
    message?: string;
  };
};

export async function parseError(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiErrorShape | null;

  return body?.error?.message ?? `Request failed with status ${response.status}.`;
}

export function getApiUrl(path: string) {
  return `${env.apiUrl}${path}`;
}
